import { BaseRepository } from './base.repository';
import { Task } from '@shared/task';
import * as admin from 'firebase-admin';

export interface ITaskRepository {
  getByUserId(userId: string): Promise<Task[]>;
  getByWorkspaceId(workspaceId: string): Promise<Task[]>;
  createWithId(data: Omit<Task, 'id' | 'position'> & { position?: number }): Promise<Task>;
  getById(id: string): Promise<Task | null>;
  getByIdAndUserId(id: string, userId: string): Promise<Task | null>;
  getByIdAndWorkspaceId(id: string, workspaceId: string): Promise<Task | null>;
  update(id: string, data: Partial<Task>): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByWorkspaceId(workspaceId: string): Promise<void>;
}

export class TaskRepository extends BaseRepository<Task> implements ITaskRepository {
  constructor() {
    super('tasks');
  }

  async getByUserId(userId: string): Promise<Task[]> {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .orderBy('position', 'asc')
      .get();
    return snapshot.docs.map(doc => doc.data() as Task);
  }

  async getByWorkspaceId(workspaceId: string): Promise<Task[]> {
    const snapshot = await this.collection
      .where('workspaceId', '==', workspaceId)
      .orderBy('position', 'asc')
      .get();
    return snapshot.docs.map(doc => doc.data() as Task);
  }

  async createWithId(data: Omit<Task, 'id' | 'position'> & { position?: number }): Promise<Task> {
    const docRef = this.collection.doc();
    
    // If position is not provided, find the current max and add 1
    let position = data.position;
    if (position === undefined) {
      const lastTaskSnapshot = await this.collection
        .where('workspaceId', '==', data.workspaceId)
        .orderBy('position', 'desc')
        .limit(1)
        .get();
      
      if (!lastTaskSnapshot.empty) {
        const lastTask = lastTaskSnapshot.docs[0].data() as Task;
        position = (lastTask.position || 0) + 1;
      } else {
        position = 0;
      }
    }

    const newTask: Task = {
      ...data,
      id: docRef.id,
      position: position!,
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

  async getByIdAndWorkspaceId(id: string, workspaceId: string): Promise<Task | null> {
    const task = await this.getById(id);
    if (task && task.workspaceId === workspaceId) {
      return task;
    }
    return null;
  }
  
  async deleteByWorkspaceId(workspaceId: string): Promise<void> {
    const snapshot = await this.collection.where('workspaceId', '==', workspaceId).get();
    if (snapshot.empty) return;

    const batch = admin.firestore().batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }
}
