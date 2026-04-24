import { Task, CreateTaskDTO } from '../../../shared/task';
import { APIResponse } from '../../../shared/api';

export class TaskApi {
  constructor(private getToken: () => Promise<string | undefined>) {}

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
