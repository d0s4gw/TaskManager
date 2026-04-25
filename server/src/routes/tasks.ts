import { Router, Response } from 'express';
import { AuthRequest, verifyToken } from '../middleware/auth';
import { ITaskRepository, TaskRepository } from '../repositories/task.repository';
import { InProcessTaskRepository } from '../repositories/in-process-task.repository';
import { CreateTaskDTO, UpdateTaskDTO } from '../../../shared/task';
import { APIResponse } from '../../../shared/api';
import { createTaskSchema, updateTaskSchema } from '../../../shared/validation';
import logger from '../logger';
import { ZodError } from 'zod';


const router = Router();

// Use in-memory repository for development to avoid Java/Emulator dependency
const useMockRepo = process.env.NODE_ENV === 'development';
let taskRepository: ITaskRepository;

if (useMockRepo) {
  const mockRepo = new InProcessTaskRepository();
  mockRepo.seed('mock-user-123');
  taskRepository = mockRepo;
  logger.info('Using In-Memory Task Repository (Seeded)');
} else {
  taskRepository = new TaskRepository();
}

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
    logger.info('Fetched tasks', { userId, count: tasks.length });
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

    const validatedData = createTaskSchema.parse(req.body);
    const { title, description, priority, dueDate, category } = validatedData;

    const now = new Date().toISOString();
    const newTask = await taskRepository.createWithId({
      title,
      description: description || '',
      completed: false,
      priority: priority || 'none',
      dueDate: dueDate || '',
      category: category || '',
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
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          message: 'Validation Failed', 
          details: error.issues.map((e: any) => ({ path: e.path, message: e.message }))
        } 
      });
    }
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

    const validatedData = updateTaskSchema.parse(req.body);
    const { title, description, completed, priority, dueDate, category, position } = validatedData;
    
    const updatedTask: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    // Only include fields that were explicitly sent
    if (title !== undefined) updatedTask.title = title;
    if (description !== undefined) updatedTask.description = description;
    if (completed !== undefined) updatedTask.completed = completed;
    if (priority !== undefined) updatedTask.priority = priority;
    if (dueDate !== undefined) updatedTask.dueDate = dueDate;
    if (category !== undefined) updatedTask.category = category;
    if (position !== undefined) updatedTask.position = position;


    await taskRepository.update(id as string, updatedTask);
    const finalTask = { ...existingTask, ...updatedTask };

    const response: APIResponse<any> = {
      success: true,
      data: finalTask,
    };
    res.json(response);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          message: 'Validation Failed', 
          details: error.issues.map((e: any) => ({ path: e.path, message: e.message }))
        } 
      });
    }
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
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          message: 'Validation Failed', 
          details: error.issues.map((e: any) => ({ path: e.path, message: e.message }))
        } 
      });
    }


    logger.error('Error in task route', {
      requestId: req.requestId,
      userId: (req as AuthRequest).user?.uid,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, error: { message: 'Internal Server Error' } });
  }
});


export default router;
