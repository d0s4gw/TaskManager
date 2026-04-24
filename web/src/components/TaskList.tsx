"use client";

import React from 'react';
import { Trash2, CheckCircle2, Circle, Calendar } from 'lucide-react';
import { Task } from '../../../shared/task';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSelectTask: (task: Task) => void;
}

export function TaskList({ tasks, onToggle, onDelete, onSelectTask }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
        <p className="text-zinc-500 dark:text-zinc-400">No tasks yet. Enjoy your day! ☀️</p>
      </div>
    );
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-950/20';
      case 'medium': return 'text-amber-500 bg-amber-50 dark:bg-amber-950/20';
      case 'low': return 'text-blue-500 bg-blue-50 dark:bg-blue-950/20';
      default: return 'text-zinc-400 bg-zinc-50 dark:bg-zinc-950/20';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div 
          key={task.id}
          className="group flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all cursor-pointer"
          onClick={() => onSelectTask(task)}
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task.id, !task.completed);
            }}
            className={`transition-colors shrink-0 ${task.completed ? 'text-green-500' : 'text-zinc-300 dark:text-zinc-700 hover:text-indigo-500'}`}
          >
            {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={`font-semibold text-zinc-900 dark:text-white truncate ${task.completed ? 'line-through opacity-50' : ''}`}>
                {task.title}
              </h4>
              {task.priority && task.priority !== 'none' && (
                <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 mt-1">
              {task.description && (
                <p className={`text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1 flex-1 ${task.completed ? 'opacity-30' : ''}`}>
                  {task.description}
                </p>
              )}
              {task.dueDate && (
                <div className={`flex items-center gap-1 text-xs font-medium ${task.completed ? 'opacity-30' : 'text-zinc-400'}`}>
                  <Calendar size={12} />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 shrink-0"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
