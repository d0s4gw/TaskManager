import { z } from 'zod';

// Recursive schema for nested subtasks
export const subtaskSchema: z.ZodType<any> = z.lazy(() => z.object({
  id: z.string(),
  title: z.string().max(100),
  description: z.string().max(500).optional(),
  completed: z.boolean(),
  priority: z.enum(['none', 'low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional().or(z.literal('')),
  category: z.string().max(50).optional(),
  labels: z.array(z.string().max(20)).max(10).optional(),
  userId: z.string().optional(),
  workspaceId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  position: z.number().optional(),
  subtasks: z.array(subtaskSchema).optional(),
}));



export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(['none', 'low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional().or(z.literal('')),
  category: z.string().max(50).optional(),
  labels: z.array(z.string().max(20)).max(10).optional(),
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  subtasks: z.array(subtaskSchema).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  completed: z.boolean().optional(),
  priority: z.enum(['none', 'low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional().or(z.literal('')),
  category: z.string().max(50).optional(),
  labels: z.array(z.string().max(20)).max(10).optional(),
  position: z.number().optional(),
  subtasks: z.array(subtaskSchema).optional(),
});

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>;


export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(50),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['owner', 'editor', 'viewer']).default('editor'),
});

export type CreateWorkspaceDTO = z.infer<typeof createWorkspaceSchema>;
export type InviteMemberDTO = z.infer<typeof inviteMemberSchema>;
