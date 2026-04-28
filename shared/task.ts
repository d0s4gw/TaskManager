import { CreateTaskDTO, UpdateTaskDTO } from './validation';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'none';
  dueDate?: string;
  category?: string;
  userId: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  position: number;
}

export type { CreateTaskDTO, UpdateTaskDTO };
