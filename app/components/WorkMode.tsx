'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGridState, useGridDispatch } from '../context/GridContext';
import { getRowLength, TOTAL_ROWS } from '../utils/grid';
import { triggerHaptic, triggerSuccessHaptic } from '../utils/haptics';

export default function WorkMode() {
  const state = useGridState();
  const dispatch = useGridDispatch();
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const { pattern } = state;
  const currentRow = pattern.progress.currentRow;

  // Screen wake lock
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch (err) {
          console.log('Wake lock request failed:', err);
        }
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      wakeLockRef.current?.release();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleRowComplete = useCallback(() => {
    if (currentRow >= TOTAL_ROWS - 1) return;
    triggerSuccessHaptic();
    dispatch({ type: 'ADVANCE_ROW' });
  }, [currentRow, dispatch]);

  const handleGoBack = useCallback(() => {
    if (currentRow <= 0) return;
    triggerHaptic('light');
    dispatch({ type: 'DECREMENT_ROW' });
  }, [currentRow, dispatch]);

  const handleUndo = useCallback(() => {
    triggerHaptic('light');
    dispatch({ type: 'UNDO' });
  }, [dispatch]);

  const handleBackToDesign = () => {
    triggerHaptic('medium');
    dispatch({ type: 'SET_MODE', mode: 'design' });
  };

  const getColor = (colorId: number | null): string => {
    if (colorId === null) return '#E5E5E5';
    const color = pattern.palette.find((c) => c.id === colorId);
    return color?.hexValue ?? '#E5E5E5';
  };

  const getColorName = (colorId: number | null): string => {
    if (colorId === null) return 'Empty';
    const color = pattern.palette.find((c) => c.id === colorId);
    return color?.name ?? 'Unknown';
  };

  const renderRowPreview = (rowIndex: number, label: string, isCurrentRow = false) => {
    if (rowIndex < 0 || rowIndex >= TOTAL_ROWS) return null;
    const row = pattern.grid[rowIndex];
    const rowLength = getRowLength(rowIndex);

    // Get dominant color info for the row
    const colorCounts: Record<number, number> = {};
    row.forEach((cell) => {
      if (cell !== null) {
        colorCounts[cell] = (colorCounts[cell] || 0) + 1;
      }
    });

    const colorSummary = Object.entries(colorCounts)
      .map(([colorId, count]) => `${count} ${getColorName(parseInt(colorId))}`)
      .join(', ') || `${rowLength} empty`;

    return (
      <div className={`${isCurrentRow ? 'bg-white rounded-xl p-4 shadow-lg border-2 border-emerald-500' : 'px-4 opacity-60'}`}>
        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
          {label}
        </div>
        <div className="flex justify-center gap-1.5 flex-wrap">
          {row.map((cell, idx) => (
            <div
              key={idx}
              className={`rounded-full ${isCurrentRow ? 'w-8 h-8' : 'w-5 h-5'} border border-gray-200`}
              style={{ backgroundColor: getColor(cell) }}
            />
          ))}
        </div>
        {isCurrentRow && (
          <div className="mt-3 text-center text-sm text-gray-600">
            {colorSummary}
          </div>
        )}
      </div>
    );
  };

  const progressPercent = Math.round((currentRow / TOTAL_ROWS) * 100);
  const isComplete = currentRow >= TOTAL_ROWS - 1 && pattern.progress.completedRows[TOTAL_ROWS - 1];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with Progress */}
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handleBackToDesign}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Design
          </button>
          <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-medium">
            Work Mode
          </span>
        </div>

        {/* Big Row Counter */}
        <div className="text-center mb-3">
          <div className="text-5xl font-bold text-gray-800">
            Row {currentRow + 1}
            <span className="text-2xl text-gray-400 font-normal"> of {TOTAL_ROWS}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="text-center mt-1 text-sm text-gray-500">
          {progressPercent}% complete
        </div>
      </header>

      {/* Row Preview Area */}
      <div className="flex-1 flex flex-col justify-center px-4 py-6 gap-4">
        {/* Previous Row */}
        {currentRow > 0 && renderRowPreview(currentRow - 1, 'Previous Row')}

        {/* Current Row - Highlighted */}
        {renderRowPreview(currentRow, `Current Row: ${getRowLength(currentRow)} bubbles`, true)}

        {/* Next Row */}
        {currentRow < TOTAL_ROWS - 1 && renderRowPreview(currentRow + 1, 'Next Row')}
      </div>

      {/* Giant Action Button */}
      <div className="px-4 pb-4 safe-area-bottom">
        {isComplete ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-2xl font-bold text-emerald-600">Complete!</div>
            <div className="text-gray-500 mt-1">Your pattern is finished!</div>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleRowComplete}
            className="w-full py-6 bg-emerald-600 rounded-2xl text-white font-bold text-xl shadow-lg hover:bg-emerald-700 transition-colors active:bg-emerald-800"
            style={{ minHeight: '80px' }}
          >
            <div className="flex items-center justify-center gap-3">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Row Complete
            </div>
            <div className="text-emerald-200 text-sm font-normal mt-1">
              Tap when done with this row
            </div>
          </motion.button>
        )}

        {/* Secondary Actions */}
        <div className="flex gap-3 mt-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleGoBack}
            disabled={currentRow <= 0}
            className="flex-1 py-4 bg-gray-100 rounded-xl text-gray-600 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-gray-200"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Go Back
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleUndo}
            disabled={state.undoStack.length === 0}
            className="flex-1 py-4 bg-gray-100 rounded-xl text-gray-600 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-gray-200"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a4 4 0 014 4v2M3 10l6-6m-6 6l6 6" />
              </svg>
              Undo
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
