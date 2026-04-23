import React, { useState } from 'react';
import { Trash2, Calendar, Tag, Edit2 } from 'lucide-react';
import TaskEditForm from './TaskEditForm';

export default function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (updatedData) => {
    onEdit(task.id, updatedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <TaskEditForm 
        task={task} 
        onSave={handleSave} 
        onCancel={handleCancel} 
      />
    );
  }

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        className="task-checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id, !task.completed)}
      />
      <div className="task-content">
        <h3 className="task-title">{task.title}</h3>
        
        {(task.due_date || task.category || task.priority) && (
          <div className="task-meta">
            {task.priority && task.priority !== 'none' && (
              <span className={`priority-badge priority-${task.priority}`}>
                {task.priority}
              </span>
            )}
            {task.due_date && (
              <span><Calendar size={14} /> {task.due_date}</span>
            )}
            {task.category && (
              <span><Tag size={14} /> {task.category}</span>
            )}
          </div>
        )}
        
        {task.description && (
          <div className="task-description">
            {task.description}
          </div>
        )}
      </div>
      <div className="task-actions">
        <button 
          className="btn-icon" 
          onClick={() => setIsEditing(true)}
          aria-label="Edit task"
        >
          <Edit2 size={20} />
        </button>
        <button 
          className="btn-icon danger" 
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}
