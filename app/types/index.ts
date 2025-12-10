export interface PaletteColor {
  id: number;
  name: string;
  hexValue: string;
  displayOrder: number;
}

export interface Pattern {
  id: string;
  name: string;
  createdAt: string;
  modifiedAt: string;
  totalRows: 27;
  palette: PaletteColor[];
  grid: (number | null)[][];
  progress: {
    currentRow: number;
    completedRows: boolean[];
  };
}

export type AppMode = 'design' | 'work';

export interface GridState {
  pattern: Pattern;
  selectedColorId: number | null;
  mode: AppMode;
  undoStack: Pattern[];
  redoStack: Pattern[];
}

export type GridAction =
  | { type: 'SET_CELL_COLOR'; row: number; col: number }
  | { type: 'CLEAR_CELL'; row: number; col: number }
  | { type: 'FILL_ROW'; row: number }
  | { type: 'SET_SELECTED_COLOR'; colorId: number }
  | { type: 'ADD_COLOR'; name: string; hexValue: string }
  | { type: 'REMOVE_COLOR'; colorId: number }
  | { type: 'SET_MODE'; mode: AppMode }
  | { type: 'ADVANCE_ROW' }
  | { type: 'DECREMENT_ROW' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_PATTERN_NAME'; name: string }
  | { type: 'RESTORE'; pattern: Pattern }
  | { type: 'NEW_PATTERN' }
  | { type: 'LOAD_PATTERN'; pattern: Pattern };
