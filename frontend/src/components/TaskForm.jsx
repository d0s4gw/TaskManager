import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export default function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAddTask({
      title,
    });
    
    setTitle('');
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="form-row" style={{ alignItems: 'flex-end' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="task-title">New Task</label>
          <input
            id="task-title"
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            autoComplete="off"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          <Plus size={20} /> Add
        </button>
      </div>
    </form>
  );
}
