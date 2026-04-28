import { Task, CreateTaskDTO } from '../../../shared/task';
import { Workspace, CreateWorkspaceDTO } from '../../../shared/workspace';
import { APIResponse } from '../../../shared/api';
import { db, appCheck } from './firebase';
import { getToken } from 'firebase/app-check';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';


export class TaskApi {
  constructor(private getToken: () => Promise<string | undefined>) {}

  subscribeToTasks(userId: string, callback: (tasks: Task[]) => void) {
    if (typeof window !== 'undefined' && (window as unknown as { __E2E_MOCK_USER__: unknown }).__E2E_MOCK_USER__) {
      // E2E Mode: Fallback to REST API once to populate the dashboard
      this.getTasks().then(callback).catch(() => console.error("E2E fetch error"));
      return () => {};
    }

    if (!db || !('type' in db)) {

      // Return a no-op if db is a dummy object (e.g. during build)
      return () => {};
    }

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      orderBy('position', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      callback(tasks);
    }, (error) => {
      console.error("Firestore subscription error:", error);
    });
  }

  subscribeToWorkspaceTasks(workspaceId: string, callback: (tasks: Task[]) => void) {
    if (typeof window !== 'undefined' && (window as unknown as { __E2E_MOCK_USER__: unknown }).__E2E_MOCK_USER__) {
      // E2E Mode: Fallback to REST API once
      this.getTasks(workspaceId).then(callback).catch(() => console.error("E2E fetch error"));
      return () => {};
    }

    if (!db || !('type' in db)) return () => {};

    const q = query(
      collection(db, 'tasks'),
      where('workspaceId', '==', workspaceId),
      orderBy('position', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      callback(tasks);
    }, (error) => {
      console.error("Workspace subscription error:", error);
    });
  }


  private async request<T>(path: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    };

    if (appCheck) {
      try {
        const appCheckTokenResponse = await getToken(appCheck, false);
        if (appCheckTokenResponse.token) {
          headers['X-Firebase-AppCheck'] = appCheckTokenResponse.token;
        }
      } catch (err) {
        console.warn("Failed to get AppCheck token", err);
      }
    }

    const res = await fetch(`/api${path}`, {
      ...options,
      headers,
      body: (options.method === 'POST' || options.method === 'PUT') && !options.body 
        ? JSON.stringify({}) 
        : options.body,
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error(`API Request Failed with status ${res.status}`);
    }

    return res.json();
  }

  async getTasks(workspaceId?: string): Promise<Task[]> {
    const path = workspaceId ? `/tasks?workspaceId=${workspaceId}` : '/tasks';
    const res = await this.request<Task[]>(path);
    return res.data || [];
  }

  async createTask(data: CreateTaskDTO): Promise<Task> {
    const res = await this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.data) throw new Error('No data returned');
    return res.data;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    await this.request<void>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(id: string): Promise<void> {
    await this.request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async getWorkspaces(): Promise<Workspace[]> {
    const res = await this.request<Workspace[]>('/workspaces');
    return res.data || [];
  }

  async createWorkspace(data: CreateWorkspaceDTO): Promise<Workspace> {
    const res = await this.request<Workspace>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.data) throw new Error('No data returned');
    return res.data;
  }

  async inviteMember(workspaceId: string, email: string, role: string): Promise<void> {
    await this.request<void>(`/workspaces/${workspaceId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  async acceptInvitation(token: string): Promise<{ workspaceId: string }> {
    const res = await this.request<{ workspaceId: string }>(`/workspaces/accept/${token}`, {
      method: 'POST',
    });
    if (!res.data) throw new Error('No data returned');
    return res.data;
  }
}
