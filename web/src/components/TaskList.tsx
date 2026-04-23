"use client";

import React from 'react';
import { Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Task } from '../../../shared/task';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
        <p className="text-zinc-500 dark:text-zinc-400">No tasks yet. Enjoy your day! ☀️</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div 
          key={task.id}
          className="group flex items-start gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all"
        >
          <button 
            onClick={() => onToggle(task.id, !task.completed)}
            className={`mt-1 transition-colors ${task.completed ? 'text-green-500' : 'text-zinc-300 dark:text-zinc-700 hover:text-indigo-500'}`}
          >
            {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
          </button>
          
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-zinc-900 dark:text-white truncate ${task.completed ? 'line-through opacity-50' : ''}`}>
              {task.title}
            </h4>
            {task.description && (
              <p className={`text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 ${task.completed ? 'opacity-30' : ''}`}>
                {task.description}
              </p>
            )}
          </div>

          <button 
            onClick={() => onDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
