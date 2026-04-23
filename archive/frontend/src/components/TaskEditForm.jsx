import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function TaskEditForm({ task, onSave, onCancel }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [priority, setPriority] = useState(task.priority || '');
  const [category, setCategory] = useState(task.category || '');

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title,
      description,
      due_date: dueDate,
      priority: priority || 'medium',
      category
    });
  };

  return (
    <div className="task-item" style={{ flexDirection: 'column' }}>
      <div className="form-group" style={{ width: '100%' }}>
        <label>Title</label>
        <input 
          type="text" 
          className="form-input" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          autoComplete="off"
        />
      </div>
      
      <div className="form-group" style={{ width: '100%' }}>
        <label>Description</label>
        <textarea 
          className="form-input" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          rows="2"
        />
      </div>
      
      <div className="form-row" style={{ width: '100%' }}>
        <div className="form-group">
          <label>Due Date</label>
          <input 
            type="date" 
            className="form-input" 
            value={dueDate} 
            onChange={e => setDueDate(e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label>Priority</label>
          <select 
            className="form-input" 
            value={priority} 
            onChange={e => setPriority(e.target.value)}
          >
            <option value="">None / Default</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="form-group">
          <label>Category</label>
          <input 
            type="text" 
            className="form-input" 
            value={category} 
            onChange={e => setCategory(e.target.value)} 
            placeholder="e.g. Work"
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end', width: '100%' }}>
        <button className="btn btn-secondary" onClick={onCancel}>
          <X size={18} /> Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          <Check size={18} /> Save
        </button>
      </div>
    </div>
  );
}
