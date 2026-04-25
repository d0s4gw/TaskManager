"use client";

import React, { useState, useEffect, useRef } from 'react';

interface PredictiveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  suggestions: string[];
  onValueChange: (value: string) => void;
}

export function PredictiveInput({ 
  suggestions, 
  onValueChange, 
  value, 
  className,
  placeholder,
  ...props 
}: PredictiveInputProps) {
  const [inputValue, setInputValue] = useState(String(value || ''));
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(String(value || ''));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onValueChange(val);

    if (val.trim()) {
      // Find suggestions that start with the input (case-insensitive)
      const filtered = suggestions
        .filter(s => s.toLowerCase().startsWith(val.toLowerCase()) && s.toLowerCase() !== val.toLowerCase())
        .slice(0, 3);
      setActiveSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && activeSuggestions.length > 0) {
      e.preventDefault();
      acceptSuggestion(activeSuggestions[0]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
    
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay hiding to allow clicking on a suggestion
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
    
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  const acceptSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    onValueChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Suggestion Bar (iMessage style) */}
      {showSuggestions && (
        <div className="absolute -top-11 left-0 right-0 flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-200 z-10 pointer-events-none">
          <div className="flex gap-1 p-1 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-xl pointer-events-auto border-b-0 rounded-b-none pb-2 -mb-1">
            {activeSuggestions.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => acceptSuggestion(s)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-xl transition-all ${
                  i === 0 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {s}
                {i === 0 && <span className="ml-2 text-[10px] opacity-70 font-normal bg-white/20 px-1 rounded uppercase">Tab</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <input
        {...props}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`${className} transition-all`}
        placeholder={placeholder}
      />
    </div>
  );
}
