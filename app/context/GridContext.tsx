'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { GridState, GridAction, Pattern, PaletteColor } from '../types';
import {
  createEmptyGrid,
  createCompletedRowsArray,
  generateId,
  TOTAL_ROWS,
  getRowLength,
} from '../utils/grid';
import { saveCurrentPattern, loadCurrentPattern } from '../utils/storage';

const DEFAULT_PALETTE: PaletteColor[] = [
  { id: 0, name: 'Ocean', hexValue: '#2D5A5A', displayOrder: 0 },
  { id: 1, name: 'Cream', hexValue: '#F5F0E6', displayOrder: 1 },
  { id: 2, name: 'Rose', hexValue: '#D4847C', displayOrder: 2 },
  { id: 3, name: 'Blush', hexValue: '#E8B4A8', displayOrder: 3 },
  { id: 4, name: 'Mustard', hexValue: '#C4A84B', displayOrder: 4 },
];

function createDefaultPattern(): Pattern {
  return {
    id: generateId(),
    name: 'My Pattern',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    totalRows: 27,
    palette: DEFAULT_PALETTE,
    grid: createEmptyGrid(),
    progress: {
      currentRow: 0,
      completedRows: createCompletedRowsArray(),
    },
  };
}

function createInitialState(): GridState {
  return {
    pattern: createDefaultPattern(),
    selectedColorId: 0,
    mode: 'design',
    undoStack: [],
    redoStack: [],
  };
}

function gridReducer(state: GridState, action: GridAction): GridState {
  switch (action.type) {
    case 'SET_CELL_COLOR': {
      if (state.selectedColorId === null) return state;
      const { row, col } = action;
      const newGrid = state.pattern.grid.map((r, ri) =>
        ri === row ? r.map((c, ci) => (ci === col ? state.selectedColorId : c)) : r
      );
      const newPattern: Pattern = {
        ...state.pattern,
        grid: newGrid,
        modifiedAt: new Date().toISOString(),
      };
      return {
        ...state,
        pattern: newPattern,
        undoStack: [...state.undoStack.slice(-19), state.pattern],
        redoStack: [],
      };
    }

    case 'CLEAR_CELL': {
      const { row, col } = action;
      const newGrid = state.pattern.grid.map((r, ri) =>
        ri === row ? r.map((c, ci) => (ci === col ? null : c)) : r
      );
      const newPattern: Pattern = {
        ...state.pattern,
        grid: newGrid,
        modifiedAt: new Date().toISOString(),
      };
      return {
        ...state,
        pattern: newPattern,
        undoStack: [...state.undoStack.slice(-19), state.pattern],
        redoStack: [],
      };
    }

    case 'FILL_ROW': {
      if (state.selectedColorId === null) return state;
      const { row } = action;
      const newGrid = state.pattern.grid.map((r, ri) =>
        ri === row ? r.map(() => state.selectedColorId) : r
      );
      const newPattern: Pattern = {
        ...state.pattern,
        grid: newGrid,
        modifiedAt: new Date().toISOString(),
      };
      return {
        ...state,
        pattern: newPattern,
        undoStack: [...state.undoStack.slice(-19), state.pattern],
        redoStack: [],
      };
    }

    case 'SET_SELECTED_COLOR':
      return { ...state, selectedColorId: action.colorId };

    case 'ADD_COLOR': {
      const maxId = Math.max(...state.pattern.palette.map((c) => c.id), -1);
      const newColor: PaletteColor = {
        id: maxId + 1,
        name: action.name,
        hexValue: action.hexValue,
        displayOrder: state.pattern.palette.length,
      };
      const newPattern: Pattern = {
        ...state.pattern,
        palette: [...state.pattern.palette, newColor],
        modifiedAt: new Date().toISOString(),
      };
      return {
        ...state,
        pattern: newPattern,
        selectedColorId: newColor.id,
      };
    }

    case 'REMOVE_COLOR': {
      const newPalette = state.pattern.palette.filter(
        (c) => c.id !== action.colorId
      );
      const newGrid = state.pattern.grid.map((row) =>
        row.map((cell) => (cell === action.colorId ? null : cell))
      );
      const newPattern: Pattern = {
        ...state.pattern,
        palette: newPalette,
        grid: newGrid,
        modifiedAt: new Date().toISOString(),
      };
      return {
        ...state,
        pattern: newPattern,
        selectedColorId:
          state.selectedColorId === action.colorId
            ? newPalette[0]?.id ?? null
            : state.selectedColorId,
        undoStack: [...state.undoStack.slice(-19), state.pattern],
        redoStack: [],
      };
    }

    case 'SET_MODE':
      return { ...state, mode: action.mode };

    case 'ADVANCE_ROW': {
      const currentRow = state.pattern.progress.currentRow;
      if (currentRow >= TOTAL_ROWS - 1) return state;
      const newCompletedRows = [...state.pattern.progress.completedRows];
      newCompletedRows[currentRow] = true;
      const newPattern: Pattern = {
        ...state.pattern,
        progress: {
          currentRow: currentRow + 1,
          completedRows: newCompletedRows,
        },
        modifiedAt: new Date().toISOString(),
      };
      return {
        ...state,
        pattern: newPattern,
        undoStack: [...state.undoStack.slice(-19), state.pattern],
        redoStack: [],
      };
    }

    case 'DECREMENT_ROW': {
      const currentRow = state.pattern.progress.currentRow;
      if (currentRow <= 0) return state;
      const newCompletedRows = [...state.pattern.progress.completedRows];
      newCompletedRows[currentRow - 1] = false;
      const newPattern: Pattern = {
        ...state.pattern,
        progress: {
          currentRow: currentRow - 1,
          completedRows: newCompletedRows,
        },
        modifiedAt: new Date().toISOString(),
      };
      return {
        ...state,
        pattern: newPattern,
        undoStack: [...state.undoStack.slice(-19), state.pattern],
        redoStack: [],
      };
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      const previousPattern = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        pattern: previousPattern,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack.slice(-19), state.pattern],
      };
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      const nextPattern = state.redoStack[state.redoStack.length - 1];
      return {
        ...state,
        pattern: nextPattern,
        undoStack: [...state.undoStack.slice(-19), state.pattern],
        redoStack: state.redoStack.slice(0, -1),
      };
    }

    case 'SET_PATTERN_NAME': {
      const newPattern: Pattern = {
        ...state.pattern,
        name: action.name,
        modifiedAt: new Date().toISOString(),
      };
      return { ...state, pattern: newPattern };
    }

    case 'RESTORE':
      return {
        ...state,
        pattern: action.pattern,
        undoStack: [],
        redoStack: [],
      };

    case 'NEW_PATTERN':
      return {
        ...state,
        pattern: createDefaultPattern(),
        undoStack: [],
        redoStack: [],
      };

    case 'LOAD_PATTERN':
      return {
        ...state,
        pattern: action.pattern,
        undoStack: [],
        redoStack: [],
      };

    default:
      return state;
  }
}

const GridStateContext = createContext<GridState | null>(null);
const GridDispatchContext = createContext<React.Dispatch<GridAction> | null>(
  null
);

export function GridProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gridReducer, null, createInitialState);

  // Load saved pattern on mount
  useEffect(() => {
    loadCurrentPattern().then((savedPattern) => {
      if (savedPattern) {
        dispatch({ type: 'RESTORE', pattern: savedPattern });
      }
    });
  }, []);

  // Auto-save pattern on changes
  useEffect(() => {
    saveCurrentPattern(state.pattern);
  }, [state.pattern]);

  return (
    <GridStateContext.Provider value={state}>
      <GridDispatchContext.Provider value={dispatch}>
        {children}
      </GridDispatchContext.Provider>
    </GridStateContext.Provider>
  );
}

export function useGridState(): GridState {
  const context = useContext(GridStateContext);
  if (!context) {
    throw new Error('useGridState must be used within a GridProvider');
  }
  return context;
}

export function useGridDispatch(): React.Dispatch<GridAction> {
  const context = useContext(GridDispatchContext);
  if (!context) {
    throw new Error('useGridDispatch must be used within a GridProvider');
  }
  return context;
}
