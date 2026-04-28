import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(['none', 'low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional().or(z.literal('')),
  category: z.string().max(50).optional(),
  workspaceId: z.string().min(1, 'Workspace ID is required'),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  completed: z.boolean().optional(),
  priority: z.enum(['none', 'low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional().or(z.literal('')),
  category: z.string().max(50).optional(),
  position: z.number().optional(),
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
