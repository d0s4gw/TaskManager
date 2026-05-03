"use client";

import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const order = ['light', 'dark', 'system'] as const;
    const currentIndex = order.indexOf(theme);
    const nextIndex = (currentIndex + 1) % order.length;
    setTheme(order[nextIndex]);
  };

  return (
    <button
      onClick={cycleTheme}
      data-testid="theme-toggle"
      className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
      title={`Theme: ${theme}`}
    >
      {theme === 'dark' ? (
        <Moon size={20} className="animate-in zoom-in duration-200" />
      ) : theme === 'light' ? (
        <Sun size={20} className="animate-in zoom-in duration-200" />
      ) : (
        <Monitor size={20} className="animate-in zoom-in duration-200" />
      )}
    </button>
  );
}
