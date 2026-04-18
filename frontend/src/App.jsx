import React, { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { CheckSquare, AlertCircle } from 'lucide-react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setError(null);
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      setError(null);
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (!res.ok) throw new Error('Failed to create task');
      const newTask = await res.json();
      if (!newTask.errors) {
        setTasks([newTask, ...tasks]);
      } else {
         setError('Validation failed: ' + newTask.errors.map(e => e.msg).join(', '));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to create task. Please try again.');
    }
  };

  const handleToggleTask = async (id, completed) => {
    const originalTasks = [...tasks];
    setTasks(tasks.map(t => t.id === id ? { ...t, completed } : t));
    
    try {
      setError(null);
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      if (!res.ok) throw new Error('Failed to update task');
    } catch (err) {
      console.error(err);
      setError('Failed to update task.');
      setTasks(originalTasks);
    }
  };

  const handleEditTask = async (id, updatedData) => {
    const originalTasks = [...tasks];
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updatedData } : t));
    
    try {
      setError(null);
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error('Failed to update task');
    } catch (err) {
      console.error(err);
      setError('Failed to update task.');
      setTasks(originalTasks);
    }
  };

  const handleDeleteTask = async (id) => {
    const originalTasks = [...tasks];
    setTasks(tasks.filter(t => t.id !== id));
    
    try {
      setError(null);
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete task');
    } catch (err) {
      console.error(err);
      setError('Failed to delete task.');
      setTasks(originalTasks);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckSquare size={36} color="var(--accent-color)" />
          TaskManager
        </h1>
      </header>

      <main>
        {error && (
          <div style={{ padding: '1rem', backgroundColor: 'var(--danger-color)', color: 'white', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}
        
        <TaskForm onAddTask={handleAddTask} />
        
        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : (
          <TaskList 
            tasks={tasks} 
            onToggle={handleToggleTask} 
            onDelete={handleDeleteTask} 
            onEdit={handleEditTask}
          />
        )}
      </main>
    </div>
  );
}

export default App;
