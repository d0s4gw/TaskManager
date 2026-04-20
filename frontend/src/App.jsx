import React, { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Auth from './components/Auth';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { CheckSquare, AlertCircle, LogOut } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        fetchTasks(currentUser);
      } else {
        setTasks([]);
      }
    });
    return unsubscribe;
  }, []);

  const getAuthHeaders = async (currentUser = user) => {
    if (!currentUser) return {};
    const token = await currentUser.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchTasks = async (currentUser) => {
    try {
      setLoading(true);
      setError(null);
      const headers = await getAuthHeaders(currentUser);
      const res = await fetch('/api/tasks', { headers });
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
      const headers = await getAuthHeaders();
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers,
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
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers,
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
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers,
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
      const headers = await getAuthHeaders();
      // fetch DELETE requires an object with headers if we pass headers, but no body
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': headers['Authorization'] // Content-Type not strictly needed for DELETE
        }
      });
      if (!res.ok) throw new Error('Failed to delete task');
    } catch (err) {
      console.error(err);
      setError('Failed to delete task.');
      setTasks(originalTasks);
    }
  };

  if (authLoading) {
    return <div className="container"><div className="loading">Loading...</div></div>;
  }

  if (!user) {
    return (
      <div className="container">
        <header className="header" style={{ justifyContent: 'center' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckSquare size={36} color="var(--accent-color)" />
            TaskManager
          </h1>
        </header>
        <Auth />
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckSquare size={36} color="var(--accent-color)" />
          TaskManager
        </h1>
        <button 
          onClick={() => signOut(auth)} 
          className="btn btn-secondary btn-icon" 
          title="Sign Out"
        >
          <LogOut size={20} />
        </button>
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
