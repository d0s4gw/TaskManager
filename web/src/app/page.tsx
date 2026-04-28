"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import { TaskDetail } from "@/components/TaskDetail";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";
import { InviteMemberDialog } from "@/components/InviteMemberDialog";
import { Task, CreateTaskDTO, UpdateTaskDTO } from "../../../shared/task";
import { Workspace } from "../../../shared/workspace";
import { LogOut, Loader2, Menu, X } from "lucide-react";
import { TaskApi } from "@/lib/api";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
} from '@dnd-kit/sortable';

export default function Home() {
  const { user, loading: authLoading, loginWithGoogle, loginWithMock, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [workspaceToInvite, setWorkspaceToInvite] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const getApi = useCallback(() => new TaskApi(() => user?.getIdToken() || Promise.resolve(undefined)), [user]);

  useEffect(() => {
    if (user) {
      // Use a microtask to avoid synchronous state update in effect body
      Promise.resolve().then(() => {
        setTasks([]);
        setTasksLoading(true);
      });
      const api = getApi();
      
      // Fetch workspaces
      api.getWorkspaces().then(setWorkspaces).catch(console.error);

      let unsubscribe: () => void;
      
      if (currentWorkspaceId) {
        unsubscribe = api.subscribeToWorkspaceTasks(currentWorkspaceId, (data) => {
          setTasks(data);
          setTasksLoading(false);
        });
      } else {
        const personalId = 'personal-' + user.uid;
        unsubscribe = api.subscribeToWorkspaceTasks(personalId, (data) => {
          setTasks(data);
          setTasksLoading(false);
        });
      }
      
      return () => unsubscribe();
    } else {
      Promise.resolve().then(() => {
        setTasks([]);
        setWorkspaces([]);
      });
    }
  }, [user, getApi, currentWorkspaceId]);

  const handleAddTask = async (taskData: CreateTaskDTO) => {
    setError(null);
    try {
      // Inject workspaceId if missing (from schema)
      const dataWithWorkspace = {
        ...taskData,
        workspaceId: currentWorkspaceId || 'personal-' + user?.uid
      };
      const newTask = await getApi().createTask(dataWithWorkspace);
      setTasks(prev => [...prev, newTask]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add task";
      setError(message);
    }
  };

  const handleCreateWorkspace = async () => {
    const name = prompt("Enter workspace name:");
    if (!name) return;
    
    try {
      const ws = await getApi().createWorkspace({ name });
      setWorkspaces(prev => [...prev, ws]);
      setCurrentWorkspaceId(ws.id);
    } catch {
      setError("Failed to create workspace");
    }
  };

  const handleInvite = (id: string) => {
    setWorkspaceToInvite(id);
    setIsInviteDialogOpen(true);
  };

  const onSendInvite = async (email: string, role: WorkspaceRole) => {
    if (!workspaceToInvite) return;
    await getApi().inviteMember(workspaceToInvite, email, role);
    alert("Invite sent! (Mock)");
  };

  const handleUpdateTask = async (id: string, updates: UpdateTaskDTO) => {
    setError(null);
    const originalTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    
    if (selectedTask?.id === id) {
      setSelectedTask(prev => prev ? { ...prev, ...updates } : null);
    }

    try {
      await getApi().updateTask(id, updates);
    } catch {
      setTasks(originalTasks);
      setError("Failed to update task");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    const newTasks = arrayMove(tasks, oldIndex, newIndex)
      .map((t, i) => ({ ...t, position: i }));
    
    setTasks(newTasks);

    try {
      const api = getApi();
      const updates = newTasks
        .filter((task, index) => {
          return tasks.find(t => t.id === task.id)?.position !== index;
        })
        .map(task => api.updateTask(task.id, { position: task.position }));

      await Promise.all(updates);
    } catch {
      setError("Failed to save new order");
      // Listener will eventually sync back if needed
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleToggleTask = async (id: string, completed: boolean) => {
    await handleUpdateTask(id, { completed });
  };

  const handleDeleteTask = async (id: string) => {
    setError(null);
    const originalTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== id));
    if (selectedTask?.id === id) setSelectedTask(null);
    
    try {
      await getApi().deleteTask(id);
    } catch {
      setTasks(originalTasks);
      setError("Failed to delete task");
    }
  };



  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="font-semibold text-zinc-900 dark:text-white tracking-tight">TaskManager</span>
          </div>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <Image 
                  src={user.photoURL || "https://ui-avatars.com/api/?name=" + (user.displayName || "User")} 
                  alt={user.displayName || "User profile"} 
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800" 
                />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{user.displayName}</span>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                title="Log Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {process.env.NODE_ENV === 'development' && (
                <button 
                  id="mock-login-button"
                  onClick={loginWithMock}
                  className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200"
                >
                  Mock Login
                </button>
              )}
              <button 
                id="login-with-google"
                onClick={loginWithGoogle}
                className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Login with Google
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex gap-12">
        {user && (
          <aside className={`${isSidebarOpen ? 'fixed inset-0 z-40 bg-white dark:bg-black p-6' : 'hidden'} md:block md:w-64 flex-shrink-0 space-y-8`}>
            {isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute top-4 right-4 p-2">
                <X size={24} />
              </button>
            )}
            <WorkspaceSwitcher 
              workspaces={workspaces}
              currentWorkspaceId={currentWorkspaceId}
              onSelect={(id) => {
                setCurrentWorkspaceId(id);
                setIsSidebarOpen(false);
              }}
              onCreate={handleCreateWorkspace}
              onInvite={handleInvite}
            />
          </aside>
        )}

        <div className="flex-1 max-w-3xl">
          {!user ? (
            <div className="space-y-12">
              <section className="text-center space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">
                  Master your workflow <br/>
                  <span className="text-indigo-600 dark:text-indigo-400">without the complexity.</span>
                </h1>
                <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                  A minimalist, high-performance task manager designed for teams who value speed and clarity.
                </p>
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={loginWithGoogle}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20"
                  >
                    Get Started for Free
                  </button>
                  {process.env.NODE_ENV === 'development' && (
                    <button 
                      onClick={loginWithMock}
                      className="px-8 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-2xl font-semibold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Try Mock Login
                    </button>
                  )}
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
                    {currentWorkspaceId ? workspaces.find(w => w.id === currentWorkspaceId)?.name : 'Personal Tasks'}
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-1">Focus on what matters today.</p>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <Menu size={24} />
                </button>
              </div>

              {error && (
                <div data-testid="error-banner" className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
                  <span>{error}</span>
                  <button onClick={() => setError(null)} className="font-bold">×</button>
                </div>
              )}

              <TaskForm 
                onAddTask={handleAddTask} 
                suggestions={Array.from(new Set(tasks.map(t => t.title)))} 
              />

              {tasksLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-zinc-300" />
                </div>
              ) : (
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <TaskList 
                  tasks={tasks} 
                  onToggle={handleToggleTask} 
                  onDelete={handleDeleteTask} 
                  onSelectTask={(task) => setSelectedTask(task)}
                />
              </DndContext>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Task Detail Sidebar */}
      <TaskDetail 
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        onToggle={handleToggleTask}
        suggestions={Array.from(new Set(tasks.map(t => t.title)))}
      />

      <InviteMemberDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        onInvite={onSendInvite}
        workspaceName={workspaces.find(w => w.id === workspaceToInvite)?.name || ''}
      />

      <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 opacity-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-900 dark:bg-white rounded flex items-center justify-center">
              <span className="text-white dark:text-black font-bold text-xs">T</span>
            </div>
            <span className="font-semibold text-sm">TaskManager &copy; 2026</span>
          </div>
          <div className="flex gap-8 text-sm font-medium">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
