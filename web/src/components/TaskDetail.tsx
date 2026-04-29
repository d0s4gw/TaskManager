"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, AlertCircle, Trash2, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Task, UpdateTaskDTO } from '../../../shared/task';
import { PredictiveInput } from './PredictiveInput';
import { LabelInput } from './LabelInput';

interface TaskDetailProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: UpdateTaskDTO) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  suggestions?: string[];
}

export function TaskDetail({ task, isOpen, onClose, onUpdate, onDelete, onToggle, suggestions = [] }: TaskDetailProps) {
  // Store the last non-null task to keep content visible during slide-out animation
  const [activeTask, setActiveTask] = useState<Task | null>(task);
  const [prevTaskId, setPrevTaskId] = useState<string | undefined>(task?.id);
  
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'none');
  const [dueDate, setDueDate] = useState(task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  const [labels, setLabels] = useState<string[]>(task?.labels || []);
  const [isSaving, setIsSaving] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Synchronize internal state when the task prop changes (pattern from React docs)
  if (task && task.id !== prevTaskId) {
    setActiveTask(task);
    setPrevTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setLabels(task.labels || []);
  }

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-save logic
  const handleUpdate = async (updates: UpdateTaskDTO) => {
    if (!activeTask) return;
    setIsSaving(true);
    try {
      await onUpdate(activeTask.id, updates);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlur = (field: keyof UpdateTaskDTO, value: string | boolean | undefined) => {
    if (!activeTask) return;
    if (activeTask[field as keyof Task] !== value) {
      handleUpdate({ [field]: value });
    }
  };

  if (!activeTask && !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div 
        ref={panelRef}
        data-testid="task-detail-panel"
        className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 z-[70] shadow-2xl transition-transform duration-500 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {activeTask && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-900">
              <div className="flex items-center gap-3">
                <button 
                  data-testid="task-detail-toggle"
                  onClick={() => onToggle(activeTask.id, !activeTask.completed)}
                  className={`transition-colors ${activeTask.completed ? 'text-green-500' : 'text-zinc-300 dark:text-zinc-700 hover:text-indigo-500'}`}
                >
                  {activeTask.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                <div className="flex items-center gap-2">
                  {isSaving ? (
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <Loader2 size={10} className="animate-spin" /> Saving...
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400">Saved</span>
                  )}
                </div>
              </div>
              <button 
                data-testid="task-detail-close"
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Title</label>
                <PredictiveInput 
                  value={title}
                  onValueChange={setTitle}
                  onBlur={() => handleBlur('title', title)}
                  className="w-full bg-transparent text-2xl font-bold text-zinc-900 dark:text-white border-none focus:ring-0 p-0 placeholder-zinc-300"
                  placeholder="Task title"
                  suggestions={suggestions}
                />
              </div>

              {/* Priority & Due Date Row */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                    <AlertCircle size={12} /> Priority
                  </label>
                  <select 
                    value={priority}
                    onChange={(e) => {
                      const val = e.target.value as Task['priority'];
                      setPriority(val);
                      handleUpdate({ priority: val });
                    }}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  >
                    <option value="none">None</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                    <Calendar size={12} /> Due Date
                  </label>
                  <input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setDueDate(newDate);
                      handleUpdate({ dueDate: newDate ? new Date(newDate).toISOString() : "" });
                    }}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Labels */}
              <LabelInput 
                labels={labels} 
                onChange={(newLabels) => {
                  setLabels(newLabels);
                  handleUpdate({ labels: newLabels });
                }} 
              />

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => handleBlur('description', description)}
                  placeholder="Add more details about this task..."
                  className="w-full bg-transparent text-zinc-600 dark:text-zinc-400 border-none focus:ring-0 p-0 resize-none min-h-[200px] text-base leading-relaxed"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to delete this task?')) {
                    onDelete(activeTask.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium text-sm transition-colors"
              >
                <Trash2 size={16} /> Delete Task
              </button>
              
              <div className="text-xs text-zinc-400" data-testid="task-detail-created">
                Created {new Date(activeTask.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
