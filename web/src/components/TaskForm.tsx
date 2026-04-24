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
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddTask({ title, description });
      setTitle('');
      setDescription('');
    } catch (error) {
      logger.error('Failed to add task', { error });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm mb-8">
      <div className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="What needs to be done?"
            className="w-full bg-transparent text-xl font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 border-none focus:ring-0 p-0"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <textarea
            placeholder="Add a description..."
            className="w-full bg-transparent text-sm text-zinc-600 dark:text-zinc-400 placeholder-zinc-400 dark:placeholder-zinc-600 border-none focus:ring-0 p-0 resize-none h-20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-full font-medium text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            Add Task
          </button>
        </div>
      </div>
    </form>
  );
}
