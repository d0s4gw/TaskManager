import { InProcessRepository } from './in-process.repository';
import { Task } from '@shared/task';
import { ITaskRepository } from './task.repository';

export class InProcessTaskRepository extends InProcessRepository<Task> implements ITaskRepository {
  async getByUserId(userId: string): Promise<Task[]> {
    return Array.from(this.items.values())
      .filter(task => task.userId === userId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
  }

  async createWithId(data: Omit<Task, 'id' | 'position'> & { position?: number }): Promise<Task> {
    const id = `mock-task-${Date.now()}`;
    
    // Find current max position
    const userTasks = await this.getByUserId(data.userId);
    const maxPosition = userTasks.reduce((max, t) => Math.max(max, t.position || 0), -1);
    const position = data.position !== undefined ? data.position : maxPosition + 1;

    const newTask: Task = {
      ...data,
      id,
      position,
    } as Task;
    
    await this.create(newTask);
    return newTask;
  }

  async getByIdAndUserId(id: string, userId: string): Promise<Task | null> {
    const task = await this.getById(id);
    if (task && task.userId === userId) {
      return task;
    }
    return null;
  }

  seed(userId: string) {
    const now = new Date().toISOString();
    const mockTasks: Task[] = [
      {
        id: 'seed-task-1',
        title: 'Welcome to TaskManager! 🚀',
        description: 'This is a mock task running on your local in-memory storage.',
        completed: false,
        priority: 'high',
        userId,
        position: 0,
        createdAt: now,
        updatedAt: now,
        category: 'Getting Started'
      },
      {
        id: 'seed-task-2',
        title: 'Try creating a new task',
        description: 'Use the input field above to add something to your list.',
        completed: true,
        priority: 'medium',
        userId,
        position: 1,
        createdAt: now,
        updatedAt: now,
        category: 'Tutorial'
      }
    ];
    mockTasks.forEach(t => this.items.set(t.id, t));
  }
}
