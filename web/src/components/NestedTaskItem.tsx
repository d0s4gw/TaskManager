"use client";

import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { Task } from '../../../shared/task';

interface NestedTaskItemProps {
  task: Task;
  level: number;
  onUpdate: (updatedTask: Task) => void;
  onDelete: () => void;
}

export function NestedTaskItem({ task, level, onUpdate, onDelete }: NestedTaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);



  const toggleComplete = () => {
    onUpdate({ ...task, completed: !task.completed });
  };

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedTitle.trim()) {
      onUpdate({ ...task, title: editedTitle.trim() });
      setIsEditing(false);
    } else {
      setEditedTitle(task.title);
      setIsEditing(false);
    }
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const now = new Date().toISOString();
    const newSubtask: Task = {
      id: `subtask-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
      priority: 'none',
      userId: task.userId,
      workspaceId: task.workspaceId,
      createdAt: now,
      updatedAt: now,
      position: (task.subtasks?.length || 0),
    };

    onUpdate({
      ...task,
      subtasks: [...(task.subtasks || []), newSubtask]
    });
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
    setIsExpanded(true);
  };


  const updateChildTask = (index: number, updatedChild: Task) => {
    const newSubtasks = [...(task.subtasks || [])];
    newSubtasks[index] = updatedChild;
    onUpdate({ ...task, subtasks: newSubtasks });
  };

  const deleteChildTask = (index: number) => {
    const newSubtasks = [...(task.subtasks || [])];
    newSubtasks.splice(index, 1);
    onUpdate({ ...task, subtasks: newSubtasks });
  };

  return (
    <div className="space-y-1">
      <div 
        className={`group flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${level > 0 ? 'ml-4 border-l border-zinc-100 dark:border-zinc-800 pl-4' : ''}`}
      >
        <button 
          onClick={toggleComplete}
          data-testid="subtask-checkbox"
          className={`transition-colors ${task.completed ? 'text-green-500' : 'text-zinc-300 dark:text-zinc-700 hover:text-indigo-500'}`}
        >

          {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        </button>

        {isEditing ? (
          <form onSubmit={handleTitleSubmit} className="flex-1">
            <input 
              autoFocus
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              className="w-full bg-transparent text-sm font-medium border-none focus:ring-0 p-0 text-zinc-900 dark:text-white"
            />
          </form>
        ) : (
          <span 
            onClick={() => setIsEditing(true)}
            className={`flex-1 text-sm font-medium cursor-text ${task.completed ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-white hover:text-indigo-600 transition-colors'}`}
          >
            {task.title || 'Untitled Subtask'}
          </span>
        )}


        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setIsAddingSubtask(true)}
            className="p-1 text-zinc-400 hover:text-indigo-500 rounded-md hover:bg-white dark:hover:bg-zinc-800 shadow-sm"
            title="Add subtask"
          >
            <Plus size={14} />
          </button>
          <button 
            onClick={onDelete}
            className="p-1 text-zinc-400 hover:text-red-500 rounded-md hover:bg-white dark:hover:bg-zinc-800 shadow-sm"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
          {task.subtasks && task.subtasks.length > 0 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-md hover:bg-white dark:hover:bg-zinc-800 shadow-sm"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
        </div>
      </div>

      {isAddingSubtask && (
        <form onSubmit={handleAddSubtask} className={`ml-8 flex items-center gap-2 p-2 border-l border-zinc-100 dark:border-zinc-800 pl-4`}>
          <input 
            autoFocus
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onBlur={() => !newSubtaskTitle && setIsAddingSubtask(false)}
            placeholder="Subtask title..."
            className="flex-1 bg-transparent text-sm border-none focus:ring-0 p-0 text-zinc-900 dark:text-white placeholder-zinc-400"
          />
          <button type="submit" className="hidden" />
        </form>
      )}

      {isExpanded && task.subtasks && task.subtasks.length > 0 && (
        <div className="space-y-1">
          {task.subtasks.map((child, index) => (
            <NestedTaskItem 
              key={child.id}
              task={child}
              level={level + 1}
              onUpdate={(updated) => updateChildTask(index, updated)}
              onDelete={() => deleteChildTask(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
