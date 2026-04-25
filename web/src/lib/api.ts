import { Task, CreateTaskDTO } from '../../../shared/task';
import { APIResponse } from '../../../shared/api';
import { db } from './firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';


export class TaskApi {
  constructor(private getToken: () => Promise<string | undefined>) {}

  subscribeToTasks(userId: string, callback: (tasks: Task[]) => void) {
    if (typeof window !== 'undefined' && (window as any).__E2E_MOCK_USER__) {
      // E2E Mode: Fallback to REST API once to populate the dashboard
      this.getTasks().then(callback).catch(err => console.error("E2E fetch error:", err));
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


  private async request<T>(path: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    const token = await this.getToken();
    const res = await fetch(`/api${path}`, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error('API Request Failed');
    }

    return res.json();
  }

  async getTasks(): Promise<Task[]> {
    const res = await this.request<Task[]>('/tasks');
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
}
