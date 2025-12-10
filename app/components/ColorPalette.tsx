'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGridState, useGridDispatch } from '../context/GridContext';
import { triggerHaptic } from '../utils/haptics';

export default function ColorPalette() {
  const state = useGridState();
  const dispatch = useGridDispatch();
  const { pattern, selectedColorId } = state;
  const [showAddColor, setShowAddColor] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#6B7280');

  const handleColorSelect = (colorId: number) => {
    triggerHaptic('light');
    dispatch({ type: 'SET_SELECTED_COLOR', colorId });
  };

  const handleAddColor = () => {
    if (newColorName.trim()) {
      dispatch({
        type: 'ADD_COLOR',
        name: newColorName.trim(),
        hexValue: newColorHex,
      });
      setNewColorName('');
      setNewColorHex('#6B7280');
      setShowAddColor(false);
      triggerHaptic('medium');
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">
        Colors
      </h3>
      <div className="flex flex-wrap gap-3">
        {pattern.palette.map((color) => (
          <motion.button
            key={color.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleColorSelect(color.id)}
            className={`relative flex flex-col items-center gap-1 p-1 rounded-lg transition-all ${
              selectedColorId === color.id
                ? 'ring-2 ring-offset-2 ring-emerald-600'
                : ''
            }`}
            aria-label={`Select ${color.name}`}
            aria-pressed={selectedColorId === color.id}
          >
            <div
              className="w-12 h-12 rounded-full border-2 border-gray-200 shadow-sm"
              style={{ backgroundColor: color.hexValue }}
            />
            <span className="text-xs text-gray-600 max-w-[60px] truncate">
              {color.name}
            </span>
          </motion.button>
        ))}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddColor(true)}
          className="flex flex-col items-center justify-center gap-1 p-1"
          aria-label="Add new color"
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <span className="text-xs text-gray-400">Add</span>
        </motion.button>
      </div>

      {showAddColor && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">
                Color Name
              </label>
              <input
                type="text"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="e.g., Sky Blue"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Color</label>
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
            </div>
            <button
              onClick={handleAddColor}
              disabled={!newColorName.trim()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddColor(false)}
              className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
