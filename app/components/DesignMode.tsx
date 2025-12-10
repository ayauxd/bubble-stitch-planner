'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BubbleGrid from './BubbleGrid';
import ColorPalette from './ColorPalette';
import { useGridState, useGridDispatch } from '../context/GridContext';
import { triggerHaptic } from '../utils/haptics';

export default function DesignMode() {
  const state = useGridState();
  const dispatch = useGridDispatch();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(state.pattern.name);

  const handleUndo = () => {
    triggerHaptic('light');
    dispatch({ type: 'UNDO' });
  };

  const handleRedo = () => {
    triggerHaptic('light');
    dispatch({ type: 'REDO' });
  };

  const handleStartWork = () => {
    triggerHaptic('medium');
    dispatch({ type: 'SET_MODE', mode: 'work' });
  };

  const handleNameSave = () => {
    dispatch({ type: 'SET_PATTERN_NAME', name: tempName });
    setIsEditingName(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          {isEditingName ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="text-lg font-semibold text-gray-800 border-b-2 border-emerald-500 focus:outline-none bg-transparent"
                autoFocus
                onBlur={handleNameSave}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              />
            </div>
          ) : (
            <button
              onClick={() => {
                setTempName(state.pattern.name);
                setIsEditingName(true);
              }}
              className="text-lg font-semibold text-gray-800 hover:text-emerald-600 transition-colors"
            >
              {state.pattern.name}
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              Design Mode
            </span>
          </div>
        </div>
      </header>

      {/* Grid Area */}
      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <BubbleGrid interactive={true} />
        </div>
      </div>

      {/* Color Palette */}
      <div className="px-4 py-2">
        <ColorPalette />
      </div>

      {/* Action Bar */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 safe-area-bottom">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleUndo}
            disabled={state.undoStack.length === 0}
            className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-xl text-gray-600 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-gray-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a4 4 0 014 4v2M3 10l6-6m-6 6l6 6" />
            </svg>
            Undo
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleRedo}
            disabled={state.redoStack.length === 0}
            className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-xl text-gray-600 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-gray-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a4 4 0 00-4 4v2M21 10l-6-6m6 6l-6 6" />
            </svg>
            Redo
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleStartWork}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 rounded-xl text-white font-medium hover:bg-emerald-700 transition-colors"
          >
            Start Crocheting
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
