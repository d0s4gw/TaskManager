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

  // Calculate ghost text
  const topSuggestion = activeSuggestions[0] || '';
  const ghostText = (showSuggestions && topSuggestion && inputValue && topSuggestion.toLowerCase().startsWith(inputValue.toLowerCase()))
    ? topSuggestion.slice(inputValue.length)
    : '';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Tab' || e.key === 'ArrowRight') && ghostText) {
      // Only accept if cursor is at the end
      if (e.currentTarget.selectionStart === inputValue.length) {
        e.preventDefault();
        acceptSuggestion(topSuggestion);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
    
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  return (
    <div className="relative w-full flex items-center" ref={containerRef}>
      {/* Ghost Text Overlay */}
      {ghostText && (
        <div 
          className={`${className} absolute inset-0 pointer-events-none flex items-center select-none whitespace-pre opacity-50`}
          aria-hidden="true"
        >
          {/* Transparent part to offset the ghost text */}
          <span className="text-transparent">{inputValue}</span>
          {/* The actual ghost text */}
          <span className="text-zinc-400 dark:text-zinc-500">
            {ghostText}
          </span>
        </div>
      )}

      <input
        {...props}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`${className} relative z-10 bg-transparent focus:outline-none w-full`}
        placeholder={placeholder}
      />
    </div>
  );
}
