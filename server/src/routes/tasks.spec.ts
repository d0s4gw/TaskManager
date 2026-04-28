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
const mockGetByUserId = jest.fn();
const mockGetByWorkspaceId = jest.fn();
const mockCreateWithId = jest.fn();
const mockGetByIdAndUserId = jest.fn();
const mockGetById = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock('../repositories/task.repository', () => {
  return {
    TaskRepository: jest.fn().mockImplementation(() => {
      return {
        getByUserId: mockGetByUserId,
        getByWorkspaceId: mockGetByWorkspaceId,
        createWithId: mockCreateWithId,
        getByIdAndUserId: mockGetByIdAndUserId,
        getById: mockGetById,
        update: mockUpdate,
        delete: mockDelete,
      };
    }),
  };
});

const mockWsGetById = jest.fn();
jest.mock('../repositories/workspace.repository', () => {
  return {
    WorkspaceRepository: jest.fn().mockImplementation(() => ({
      getById: mockWsGetById,
    })),
  };
});

import request from 'supertest';
import app from '../index';

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

    it('should return tasks for a workspace if user is member', async () => {
      const mockTasks = [{ id: '1', title: 'Ws Task', workspaceId: 'ws1' }];
      mockWsGetById.mockResolvedValue({ id: 'ws1', memberIds: ['test-user-id'] });
      mockGetByWorkspaceId.mockResolvedValue(mockTasks);

      const res = await request(app)
        .get('/api/tasks?workspaceId=ws1')
        .set('Authorization', 'Bearer fake-token');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockTasks);
    });

    it('should return 403 if user is not member of workspace', async () => {
      mockWsGetById.mockResolvedValue({ id: 'ws1', memberIds: ['other-user'] });

      const res = await request(app)
        .get('/api/tasks?workspaceId=ws1')
        .set('Authorization', 'Bearer fake-token');

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task if user is workspace member', async () => {
      const newTaskData = { title: 'New Task', workspaceId: 'ws1' };
      mockWsGetById.mockResolvedValue({ id: 'ws1', memberIds: ['test-user-id'] });
      mockCreateWithId.mockResolvedValue({ ...newTaskData, id: 'new-id', userId: 'test-user-id' });

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', 'Bearer fake-token')
        .send(newTaskData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 403 if user is not workspace member', async () => {
      const newTaskData = { title: 'New Task', workspaceId: 'ws1' };
      mockWsGetById.mockResolvedValue({ id: 'ws1', memberIds: ['other-user'] });

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', 'Bearer fake-token')
        .send(newTaskData);

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should allow updating if user is workspace member even if not creator', async () => {
      const existingTask = { id: '1', title: 'Old', userId: 'other-user', workspaceId: 'ws1' };
      mockGetById.mockResolvedValue(existingTask);
      mockWsGetById.mockResolvedValue({ id: 'ws1', memberIds: ['test-user-id'] });
      mockUpdate.mockResolvedValue(undefined);

      const res = await request(app)
        .put('/api/tasks/1')
        .set('Authorization', 'Bearer fake-token')
        .send({ title: 'New' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('New');
    });

    it('should return 403 if user is not in workspace', async () => {
      const existingTask = { id: '1', userId: 'other-user', workspaceId: 'ws1' };
      mockGetById.mockResolvedValue(existingTask);
      mockWsGetById.mockResolvedValue({ id: 'ws1', memberIds: ['other-user'] });

      const res = await request(app)
        .put('/api/tasks/1')
        .set('Authorization', 'Bearer fake-token')
        .send({ title: 'New' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should allow deleting if user is workspace member', async () => {
      const existingTask = { id: '1', userId: 'other-user', workspaceId: 'ws1' };
      mockGetById.mockResolvedValue(existingTask);
      mockWsGetById.mockResolvedValue({ id: 'ws1', memberIds: ['test-user-id'] });
      mockDelete.mockResolvedValue(undefined);

      const res = await request(app)
        .delete('/api/tasks/1')
        .set('Authorization', 'Bearer fake-token');

      expect(res.status).toBe(200);
    });
  });
});
