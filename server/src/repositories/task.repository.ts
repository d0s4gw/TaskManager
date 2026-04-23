import { BaseRepository } from './base.repository';
import { Task } from '../../../shared/task';
import * as admin from 'firebase-admin';

export class TaskRepository extends BaseRepository<Task> {
  constructor() {
    super('tasks');
  }

  async getByUserId(userId: string): Promise<Task[]> {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => doc.data() as Task);
  }

  async createWithId(data: Omit<Task, 'id'>): Promise<Task> {
    const docRef = this.collection.doc();
    const newTask: Task = {
      ...data,
      id: docRef.id,
    } as Task;
    await docRef.set(newTask);
    return newTask;
  }

  async getByIdAndUserId(id: string, userId: string): Promise<Task | null> {
    const task = await this.getById(id);
    if (task && task.userId === userId) {
      return task;
    }
    return null;
  }
}
