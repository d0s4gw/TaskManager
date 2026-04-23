import { describe, it, expect, vi, beforeEach } from 'vitest';
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
    (fetch as any).mockResolvedValue({
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
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
    });

    await expect(api.getTasks()).rejects.toThrow('Unauthorized');
  });

  it('should create a task with correct body', async () => {
    const taskData = { title: 'New' };
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { ...taskData, id: '1' } }),
    });

    await api.createTask(taskData as any);

    expect(fetch).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(taskData),
    }));
  });
});
