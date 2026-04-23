// Mock Auth Middleware
jest.mock('../middleware/auth', () => ({
  verifyToken: jest.fn(async (req: any, res: any, next: any) => {
    req.user = { uid: 'test-user-id' };
    next();
    return undefined;
  }),
}));

// Mock Tracing to avoid initialization errors
jest.mock('../tracing', () => ({
  startTracing: jest.fn(),
}));

// Use 'var' to avoid Temporal Dead Zone issues with hoisted jest.mock
var mockGetByUserId = jest.fn();
var mockCreateWithId = jest.fn();
var mockGetByIdAndUserId = jest.fn();
var mockUpdate = jest.fn();
var mockDelete = jest.fn();

jest.mock('../repositories/task.repository', () => {
  return {
    TaskRepository: jest.fn().mockImplementation(() => {
      return {
        getByUserId: mockGetByUserId,
        createWithId: mockCreateWithId,
        getByIdAndUserId: mockGetByIdAndUserId,
        update: mockUpdate,
        delete: mockDelete,
      };
    }),
  };
});

import request from 'supertest';
import app from '../index';
import { TaskRepository } from '../repositories/task.repository';

describe('Task Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
    it('should return tasks for the authenticated user', async () => {
      const mockTasks = [{ id: '1', title: 'Test Task', userId: 'test-user-id' }];
      mockGetByUserId.mockResolvedValue(mockTasks as any);

      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer fake-token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockTasks);
      expect(mockGetByUserId).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTaskData = { title: 'New Task', description: 'Test Desc' };
      const savedTask = { ...newTaskData, id: 'new-id', userId: 'test-user-id', completed: false };
      mockCreateWithId.mockResolvedValue(savedTask as any);

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', 'Bearer fake-token')
        .send(newTaskData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(savedTask);
      expect(mockCreateWithId).toHaveBeenCalled();
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', 'Bearer fake-token')
        .send({ description: 'No title' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update an existing task', async () => {
      const existingTask = { id: '1', title: 'Old Title', userId: 'test-user-id' };
      mockGetByIdAndUserId.mockResolvedValue(existingTask as any);
      mockUpdate.mockResolvedValue(undefined);

      const res = await request(app)
        .put('/api/tasks/1')
        .set('Authorization', 'Bearer fake-token')
        .send({ title: 'New Title' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('New Title');
    });

    it('should return 404 if task not found', async () => {
      mockGetByIdAndUserId.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/tasks/non-existent')
        .set('Authorization', 'Bearer fake-token')
        .send({ title: 'New Title' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete an existing task', async () => {
      const existingTask = { id: '1', userId: 'test-user-id' };
      mockGetByIdAndUserId.mockResolvedValue(existingTask as any);
      mockDelete.mockResolvedValue(undefined);

      const res = await request(app)
        .delete('/api/tasks/1')
        .set('Authorization', 'Bearer fake-token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
