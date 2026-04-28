// Mock Auth Middleware
jest.mock('../middleware/auth', () => ({
  verifyToken: jest.fn(async (req: any, res: any, next: any) => {
    req.user = { uid: 'test-user-id', name: 'Test User' };
    next();
    return undefined;
  }),
}));

// Mock Tracing
jest.mock('../tracing', () => ({
  startTracing: jest.fn(),
}));

const mockWsGetByUserId = jest.fn();
const mockWsCreate = jest.fn();
const mockWsGetById = jest.fn();
const mockWsAddMember = jest.fn();
const mockWsDelete = jest.fn();

const mockInvGetByToken = jest.fn();
const mockInvCreate = jest.fn();
const mockInvUpdateStatus = jest.fn();

const mockTaskDeleteByWorkspaceId = jest.fn();

jest.mock('../repositories/workspace.repository', () => ({
  WorkspaceRepository: jest.fn().mockImplementation(() => ({
    getByUserId: mockWsGetByUserId,
    create: mockWsCreate,
    getById: mockWsGetById,
    addMember: mockWsAddMember,
    delete: mockWsDelete,
  })),
}));

jest.mock('../repositories/task.repository', () => ({
  TaskRepository: jest.fn().mockImplementation(() => ({
    deleteByWorkspaceId: mockTaskDeleteByWorkspaceId,
  })),
}));

jest.mock('../repositories/invitation.repository', () => ({
  InvitationRepository: jest.fn().mockImplementation(() => ({
    getByToken: mockInvGetByToken,
    create: mockInvCreate,
    updateStatus: mockInvUpdateStatus,
  })),
}));

import request from 'supertest';
import app from '../index';

describe('Workspace Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure we are not in development mode for these tests to use the mocked real repositories
    // (Actually the index.ts handles repo selection, so we just mock the classes)
  });

  describe('GET /api/workspaces', () => {
    it('should return workspaces for the user', async () => {
      const mockWorkspaces = [{ id: 'ws1', name: 'My Workspace' }];
      mockWsGetByUserId.mockResolvedValue(mockWorkspaces);

      const res = await request(app)
        .get('/api/workspaces')
        .set('Authorization', 'Bearer fake-token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockWorkspaces);
    });
  });

  describe('POST /api/workspaces', () => {
    it('should create a new workspace', async () => {
      const wsData = { name: 'New Team' };
      mockWsCreate.mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/workspaces')
        .set('Authorization', 'Bearer fake-token')
        .send(wsData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New Team');
      expect(res.body.data.memberIds).toContain('test-user-id');
    });
  });

  describe('POST /api/workspaces/:id/invite', () => {
    it('should create an invitation if user is owner/member', async () => {
      const workspace = { id: 'ws1', name: 'Team', memberIds: ['test-user-id'] };
      mockWsGetById.mockResolvedValue(workspace);
      mockInvCreate.mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/workspaces/ws1/invite')
        .set('Authorization', 'Bearer fake-token')
        .send({ email: 'new@test.com', role: 'editor' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockInvCreate).toHaveBeenCalled();
    });

    it('should return 403 if user is not in workspace', async () => {
      const workspace = { id: 'ws1', name: 'Team', memberIds: ['other-user'] };
      mockWsGetById.mockResolvedValue(workspace);

      const res = await request(app)
        .post('/api/workspaces/ws1/invite')
        .set('Authorization', 'Bearer fake-token')
        .send({ email: 'new@test.com', role: 'editor' });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/workspaces/accept/:token', () => {
    it('should add member to workspace and update invitation', async () => {
      const invitation = { 
        id: 'inv1', 
        token: 'tok123', 
        workspaceId: 'ws1', 
        status: 'pending', 
        role: 'editor',
        expiresAt: new Date(Date.now() + 10000).toISOString()
      };
      mockInvGetByToken.mockResolvedValue(invitation);
      mockWsAddMember.mockResolvedValue(undefined);
      mockInvUpdateStatus.mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/workspaces/accept/tok123')
        .set('Authorization', 'Bearer fake-token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockWsAddMember).toHaveBeenCalledWith('ws1', expect.objectContaining({
        userId: 'test-user-id',
        role: 'editor'
      }));
    });
  });

  describe('DELETE /api/workspaces/:id', () => {
    it('should delete workspace and tasks if user is owner', async () => {
      const workspace = { id: 'ws1', ownerId: 'test-user-id' };
      mockWsGetById.mockResolvedValue(workspace);
      mockWsDelete.mockResolvedValue(undefined);
      mockTaskDeleteByWorkspaceId.mockResolvedValue(undefined);

      const res = await request(app)
        .delete('/api/workspaces/ws1')
        .set('Authorization', 'Bearer fake-token');

      expect(res.status).toBe(200);
      expect(mockTaskDeleteByWorkspaceId).toHaveBeenCalledWith('ws1');
      expect(mockWsDelete).toHaveBeenCalledWith('ws1');
    });

    it('should return 400 when trying to delete personal workspace', async () => {
      const res = await request(app)
        .delete('/api/workspaces/personal-test-user-id')
        .set('Authorization', 'Bearer fake-token');

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('personal workspace');
    });

    it('should return 403 if user is not the owner', async () => {
      const workspace = { id: 'ws1', ownerId: 'other-user' };
      mockWsGetById.mockResolvedValue(workspace);

      const res = await request(app)
        .delete('/api/workspaces/ws1')
        .set('Authorization', 'Bearer fake-token');

      expect(res.status).toBe(403);
      expect(res.body.error.message).toContain('owner');
    });
  });
});
