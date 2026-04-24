"use client";

import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { CreateTaskDTO } from '../../../shared/task';
import { logger } from '../lib/logger';

interface TaskFormProps {
  onAddTask: (task: CreateTaskDTO) => Promise<void>;
}

export function TaskForm({ onAddTask }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddTask({ title });
      setTitle('');
    } catch (error) {
      logger.error('Failed to add task', { error });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-6 py-3 shadow-sm hover:shadow-md transition-shadow mb-8 flex items-center gap-4"
    >
      <input
        type="text"
        placeholder="What needs to be done? (Press Enter)"
        className="flex-1 bg-transparent text-lg font-medium text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 border-none focus:ring-0 p-0"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isSubmitting}
        autoFocus
      />
      <button
        type="submit"
        disabled={isSubmitting || !title.trim()}
        className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white rounded-full transition-all flex items-center justify-center shrink-0"
      >
        {isSubmitting ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Plus size={20} />
        )}
      </button>
    </form>
  );
}
