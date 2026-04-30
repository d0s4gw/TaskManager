import { describe, it, expect } from 'vitest';
import { createTaskSchema, updateTaskSchema, subtaskSchema } from './validation';

describe('Task Validation', () => {
  it('validates a basic task', () => {
    const result = createTaskSchema.safeParse({
      title: 'Valid Task',
      workspaceId: 'ws-1'
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty title', () => {
    const result = createTaskSchema.safeParse({
      title: '',
      workspaceId: 'ws-1'
    });
    expect(result.success).toBe(false);
  });

  it('validates recursive subtasks', () => {
    const taskWithSubtasks = {
      title: 'Root',
      workspaceId: 'ws-1',
      subtasks: [
        {
          id: 'sub-1',
          title: 'Sub 1',
          completed: false,
          userId: 'u1',
          workspaceId: 'ws-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          position: 0,
          subtasks: [
            {
              id: 'sub-2',
              title: 'Sub 2',
              completed: true,
              userId: 'u1',
              workspaceId: 'ws-1',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              position: 0
            }
          ]
        }
      ]
    };
    const result = updateTaskSchema.safeParse(taskWithSubtasks);
    expect(result.success).toBe(true);
  });

  it('allows empty titles for subtasks', () => {
    const subtask = {
      id: 'sub-1',
      title: '',
      completed: false,
      userId: 'u1',
      workspaceId: 'ws-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      position: 0
    };
    const result = subtaskSchema.safeParse(subtask);
    expect(result.success).toBe(true);
  });
});
