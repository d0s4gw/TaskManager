"use client";

import React, { useState } from 'react';
import { X, Tag } from 'lucide-react';

interface LabelInputProps {
  labels: string[];
  onChange: (labels: string[]) => void;
  disabled?: boolean;
}

import { stringToColorClass } from '../lib/colors';

export function LabelInput({ labels = [], onChange, disabled = false }: LabelInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newLabel = inputValue.trim().toLowerCase();
      if (newLabel && !labels.includes(newLabel) && labels.length < 10) {
        onChange([...labels, newLabel]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && labels.length > 0) {
      e.preventDefault();
      onChange(labels.slice(0, -1));
    }
  };

  const removeLabel = (labelToRemove: string) => {
    onChange(labels.filter(label => label !== labelToRemove));
  };

  return (
    <div className="w-full">
      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1 mb-2">
        <Tag size={12} /> Labels
      </label>
      
      <div className={`flex flex-wrap items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all focus-within:ring-2 focus-within:ring-indigo-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {labels.map((label) => (
          <span 
            key={label}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${stringToColorClass(label)}`}
          >
            {label}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeLabel(label)}
                className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors focus:outline-none"
              >
                <X size={10} />
              </button>
            )}
          </span>
        ))}
        
        {!disabled && labels.length < 10 && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={labels.length === 0 ? "Type and press enter..." : ""}
            className="flex-1 min-w-[120px] bg-transparent text-sm text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-600 border-none focus:outline-none focus:ring-0 p-1"
            maxLength={20}
          />
        )}
      </div>
      
      {labels.length >= 10 && (
        <p className="text-xs text-amber-500 mt-1">Maximum of 10 labels reached.</p>
      )}
    </div>
  );
}
