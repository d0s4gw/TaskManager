"use client";

import React, { useState, useRef } from 'react';

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
  const [matchState, setMatchState] = useState<{ suggestion: string, suffix: string, ghostText: string } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setInputValue(String(value || ''));
    setPrevValue(value);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onValueChange(val);

    if (val.trim()) {
      const lowerVal = val.toLowerCase();
      const matchPrefixes: string[] = [];
      matchPrefixes.push(lowerVal);
      for (let i = 0; i < lowerVal.length; i++) {
        if (lowerVal[i] === ' ') {
          matchPrefixes.push(lowerVal.substring(i + 1));
        }
      }

      let foundMatch = null;
      for (const suffix of matchPrefixes) {
        if (!suffix) continue;
        for (const suggestion of suggestions) {
          if (suggestion.toLowerCase().startsWith(suffix) && suggestion.length > suffix.length) {
            const isFirstWord = lowerVal.trim().length === suffix.length;
            const casedSuggestion = isFirstWord 
              ? suggestion.charAt(0).toUpperCase() + suggestion.slice(1).toLowerCase()
              : suggestion.toLowerCase();

            const ghostText = casedSuggestion.substring(suffix.length);
            foundMatch = { suggestion: casedSuggestion, suffix, ghostText };
            break;
          }
        }
        if (foundMatch) break;
      }
      
      setMatchState(foundMatch);
      setShowSuggestions(!!foundMatch);
    } else {
      setMatchState(null);
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
  const ghostText = showSuggestions && matchState ? matchState.ghostText : '';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Tab' || e.key === 'ArrowRight') && matchState) {
      // Only accept if cursor is at the end
      if (e.currentTarget.selectionStart === inputValue.length) {
        e.preventDefault();
        const baseInput = inputValue.slice(0, -matchState.suffix.length);
        acceptSuggestion(baseInput + matchState.suggestion);
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
