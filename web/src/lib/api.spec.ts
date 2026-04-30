import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { TaskApi } from './api';

describe('TaskApi', () => {
  const mockToken = 'fake-token';
  const getToken = vi.fn().mockResolvedValue(mockToken);
  let api: TaskApi;

  beforeEach(() => {
    api = new TaskApi(getToken);
    vi.stubGlobal('fetch', vi.fn());
    vi.clearAllMocks();
  });

  it('should fetch tasks with correct headers', async () => {
    const mockTasks = [{ id: '1', title: 'Test Task' }];
    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockTasks }),
    });

    const result = await api.getTasks();

    expect(fetch).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({
      headers: expect.objectContaining({
        'Authorization': `Bearer ${mockToken}`,
      }),
    }));
    expect(result).toEqual(mockTasks);
  });

  it('should throw "Unauthorized" on 401', async () => {
    (fetch as Mock).mockResolvedValue({
      ok: false,
      status: 401,
    });

    await expect(api.getTasks()).rejects.toThrow('Unauthorized');
  });

  it('should create a task with correct body', async () => {
    const taskData = { title: 'New' };
    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { ...taskData, id: '1' } }),
    });

    await api.createTask(taskData as Parameters<typeof api.createTask>[0]);

    expect(fetch).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(taskData),
    }));
  });

  it('should update a task with correct body', async () => {
    const updates = { title: 'Updated' };
    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { id: '1', ...updates } }),
    });

    await api.updateTask('1', updates);

    expect(fetch).toHaveBeenCalledWith('/api/tasks/1', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify(updates),
    }));
  });

  it('should delete a task', async () => {
    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await api.deleteTask('1');

    expect(fetch).toHaveBeenCalledWith('/api/tasks/1', expect.objectContaining({
      method: 'DELETE',
    }));
  });

  it('should fetch workspaces', async () => {
    const mockWorkspaces = [{ id: 'ws1', name: 'Ws 1' }];
    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockWorkspaces }),
    });

    const result = await api.getWorkspaces();

    expect(fetch).toHaveBeenCalledWith('/api/workspaces', expect.anything());
    expect(result).toEqual(mockWorkspaces);
  });
});

