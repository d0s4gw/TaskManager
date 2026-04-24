export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'none';
  dueDate?: string;
  category?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  position: number;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'none';
  dueDate?: string;
  category?: string;
  position?: number;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'none';
  dueDate?: string;
  category?: string;
  position?: number;
}
