import { Router, Response } from 'express';
import { AuthRequest, verifyToken } from '../middleware/auth';
import { TaskRepository } from '../repositories/task.repository';
import { CreateTaskDTO, UpdateTaskDTO } from '../../../shared/task';
import { APIResponse } from '../../../shared/api';
import logger from '../logger';

const router = Router();
const taskRepository = new TaskRepository();

// Apply auth middleware to all task routes
router.use(verifyToken);

// Get all tasks for the logged-in user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const tasks = await taskRepository.getByUserId(userId);
    const response: APIResponse<any> = {
      success: true,
      data: tasks,
    };
    res.json(response);
  } catch (error) {
    logger.error('Error fetching tasks', {
      requestId: req.requestId,
      userId: (req as AuthRequest).user?.uid,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, error: { message: 'Internal Server Error' } });
  }
});

// Create a task
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const taskData: CreateTaskDTO = req.body;
    if (!taskData.title) {
      return res.status(400).json({ success: false, error: { message: 'Title is required' } });
    }

    const now = new Date().toISOString();
    const newTask = await taskRepository.createWithId({
      ...taskData,
      description: taskData.description || '',
      completed: false,
      priority: taskData.priority || 'none',
      dueDate: taskData.dueDate || '',
      category: taskData.category || '',
      userId,
      createdAt: now,
      updatedAt: now,
    });

    const response: APIResponse<any> = {
      success: true,
      data: newTask,
    };
    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating task', {
      requestId: req.requestId,
      userId: (req as AuthRequest).user?.uid,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, error: { message: 'Internal Server Error' } });
  }
});

// Update a task
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { id } = req.params;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const existingTask = await taskRepository.getByIdAndUserId(id as string, userId);
    if (!existingTask) {
      return res.status(404).json({ success: false, error: { message: 'Task not found' } });
    }

    const updateData: UpdateTaskDTO = req.body;
    const updatedTask = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    await taskRepository.update(id as string, updatedTask);
    const finalTask = { ...existingTask, ...updatedTask };

    const response: APIResponse<any> = {
      success: true,
      data: finalTask,
    };
    res.json(response);
  } catch (error) {
    logger.error('Error updating task', {
      requestId: req.requestId,
      taskId: req.params.id,
      userId: (req as AuthRequest).user?.uid,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, error: { message: 'Internal Server Error' } });
  }
});

// Delete a task
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { id } = req.params;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const existingTask = await taskRepository.getByIdAndUserId(id as string, userId);
    if (!existingTask) {
      return res.status(404).json({ success: false, error: { message: 'Task not found' } });
    }

    await taskRepository.delete(id as string);
    res.json({ success: true });
  } catch (error) {
    logger.error('Error deleting task', {
      requestId: req.requestId,
      taskId: req.params.id,
      userId: (req as AuthRequest).user?.uid,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, error: { message: 'Internal Server Error' } });
  }
});

export default router;
