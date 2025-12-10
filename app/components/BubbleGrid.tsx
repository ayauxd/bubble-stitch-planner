'use client';

import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGridState, useGridDispatch } from '../context/GridContext';
import { getRowLength, TOTAL_ROWS } from '../utils/grid';
import { triggerHaptic } from '../utils/haptics';

const CELL_SIZE = 44;
const CELL_SPACING = 4;
const ROW_HEIGHT = CELL_SIZE * 0.85;

interface BubbleGridProps {
  interactive?: boolean;
  highlightRow?: number;
  compact?: boolean;
}

export default function BubbleGrid({
  interactive = true,
  highlightRow,
  compact = false,
}: BubbleGridProps) {
  const state = useGridState();
  const dispatch = useGridDispatch();
  const { pattern, selectedColorId } = state;
  const [isDragging, setIsDragging] = useState(false);
  const lastCellRef = useRef<{ row: number; col: number } | null>(null);

  const cellSize = compact ? CELL_SIZE * 0.6 : CELL_SIZE;
  const rowHeight = compact ? ROW_HEIGHT * 0.6 : ROW_HEIGHT;

  const maxRowLength = 9;
  const svgWidth = maxRowLength * (cellSize + CELL_SPACING) + cellSize;
  const svgHeight = TOTAL_ROWS * rowHeight + cellSize;

  const getColor = useCallback(
    (colorId: number | null): string => {
      if (colorId === null) return '#E5E5E5';
      const color = pattern.palette.find((c) => c.id === colorId);
      return color?.hexValue ?? '#E5E5E5';
    },
    [pattern.palette]
  );

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!interactive) return;
      triggerHaptic('light');
      if (pattern.grid[row][col] === selectedColorId) {
        dispatch({ type: 'CLEAR_CELL', row, col });
      } else {
        dispatch({ type: 'SET_CELL_COLOR', row, col });
      }
    },
    [interactive, dispatch, pattern.grid, selectedColorId]
  );

  const handlePointerDown = useCallback(
    (row: number, col: number) => {
      if (!interactive) return;
      setIsDragging(true);
      lastCellRef.current = { row, col };
      handleCellClick(row, col);
    },
    [interactive, handleCellClick]
  );

  const handlePointerMove = useCallback(
    (row: number, col: number) => {
      if (!isDragging || !interactive) return;
      if (
        lastCellRef.current?.row !== row ||
        lastCellRef.current?.col !== col
      ) {
        lastCellRef.current = { row, col };
        triggerHaptic('light');
        dispatch({ type: 'SET_CELL_COLOR', row, col });
      }
    },
    [isDragging, interactive, dispatch]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    lastCellRef.current = null;
  }, []);

  const getCellPosition = (row: number, col: number) => {
    const rowLength = getRowLength(row);
    const offset = row % 2 === 1 ? (cellSize + CELL_SPACING) / 2 : 0;
    const rowOffset = ((maxRowLength - rowLength) * (cellSize + CELL_SPACING)) / 2;
    const x = col * (cellSize + CELL_SPACING) + offset + rowOffset + cellSize / 2;
    const y = row * rowHeight + cellSize / 2;
    return { x, y };
  };

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="touch-none select-none"
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {pattern.grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const { x, y } = getCellPosition(rowIndex, colIndex);
          const isHighlighted = highlightRow === rowIndex;
          const colorValue = getColor(cell);

          return (
            <motion.circle
              key={`${rowIndex}-${colIndex}`}
              cx={x}
              cy={y}
              r={cellSize / 2 - 2}
              fill={colorValue}
              stroke={isHighlighted ? '#2D5A5A' : '#D1D5DB'}
              strokeWidth={isHighlighted ? 3 : 1}
              style={{ cursor: interactive ? 'pointer' : 'default' }}
              whileTap={interactive ? { scale: 0.9 } : undefined}
              onPointerDown={() => handlePointerDown(rowIndex, colIndex)}
              onPointerEnter={() => handlePointerMove(rowIndex, colIndex)}
              aria-label={`Row ${rowIndex + 1}, Bubble ${colIndex + 1}, ${
                cell !== null
                  ? pattern.palette.find((c) => c.id === cell)?.name ?? 'colored'
                  : 'empty'
              }`}
            />
          );
        })
      )}
    </svg>
  );
}
