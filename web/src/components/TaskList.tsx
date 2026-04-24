"use client";

import React from 'react';
import { CheckCircle2, Circle, Trash2, Calendar, GripVertical } from 'lucide-react';
import { Task } from '../../../shared/task';
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSelectTask: (task: Task) => void;
}

interface SortableItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSelectTask: (task: Task) => void;
}

function SortableItem({ task, onToggle, onDelete, onSelectTask, index }: SortableItemProps & { index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`task-item-${index}`}
      className={`group relative flex items-center gap-4 p-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl transition-all hover:shadow-md hover:border-indigo-500/30 dark:hover:border-indigo-400/30 ${isDragging ? 'shadow-xl scale-[1.02] border-indigo-500 bg-white dark:bg-zinc-800 z-50' : ''}`}
      onClick={() => onSelectTask(task)}
    >
      <button 
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="cursor-grab active:cursor-grabbing text-zinc-300 dark:text-zinc-700 hover:text-zinc-500 transition-colors p-1"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={18} />
      </button>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id, !task.completed);
        }}
        aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
        className={`transition-colors ${task.completed ? 'text-green-500' : 'text-zinc-300 dark:text-zinc-700 hover:text-indigo-500'}`}
      >
        {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
      </button>
      
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium truncate ${task.completed ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-white'}`}>
          {task.title}
        </h3>
        {(task.priority !== 'none' || task.dueDate) && (
          <div className="flex gap-3 mt-1.5">
            {task.priority !== 'none' && (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                task.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                task.priority === 'medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
                'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
              }`}>
                {task.priority}
              </span>
            )}
            {task.dueDate && (
              <span className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                <Calendar size={10} />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
        aria-label="Delete task"
        className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-500 transition-all rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export function TaskList({ tasks, onToggle, onDelete, onSelectTask }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
        <div className="text-zinc-400 mb-2">No tasks yet</div>
        <div className="text-sm text-zinc-500">Create one to get started</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <SortableContext 
        items={tasks.map(t => t.id)} 
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task, index) => (
          <SortableItem 
            key={task.id} 
            task={task}
            index={index}
            onToggle={onToggle} 
            onDelete={onDelete} 
            onSelectTask={onSelectTask}
          />
        ))}
      </SortableContext>
    </div>
  );
}
