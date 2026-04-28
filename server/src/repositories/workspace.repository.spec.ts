import { WorkspaceRepository } from './workspace.repository';
import * as admin from 'firebase-admin';

const mockDoc = {
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  get: jest.fn(),
  doc: jest.fn(() => mockDoc),
};

jest.mock('firebase-admin', () => ({
  firestore: jest.fn(() => mockFirestore),
}));

// Mock FieldValue.arrayUnion
(admin as any).firestore.FieldValue = {
  arrayUnion: jest.fn(val => ({ _val: val, _type: 'arrayUnion' })),
};

describe('WorkspaceRepository', () => {
  let repository: WorkspaceRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new WorkspaceRepository();
  });

  describe('getByUserId', () => {
    it('should fetch workspaces where user is a member', async () => {
      const mockWorkspaces = [
        { id: 'ws1', name: 'Workspace 1', memberIds: ['user1'] },
      ];
      mockFirestore.get.mockResolvedValue({
        docs: mockWorkspaces.map(w => ({ data: () => w })),
      });

      const result = await repository.getByUserId('user1');

      expect(mockFirestore.collection).toHaveBeenCalledWith('workspaces');
      expect(mockFirestore.where).toHaveBeenCalledWith('memberIds', 'array-contains', 'user1');
      expect(result).toEqual(mockWorkspaces);
    });
  });

  describe('addMember', () => {
    it('should add a member and update memberIds array', async () => {
      const workspaceId = 'ws1';
      const newMember = {
        userId: 'user2',
        role: 'editor' as any,
        joinedAt: new Date().toISOString(),
      };

      await repository.addMember(workspaceId, newMember);

      expect(mockFirestore.doc).toHaveBeenCalledWith(workspaceId);
      expect(mockDoc.update).toHaveBeenCalledWith({
        members: expect.anything(),
        memberIds: expect.anything(),
        updatedAt: expect.any(String),
      });
    });
  });

  describe('getById', () => {
    it('should return workspace if it exists', async () => {
      const mockWorkspace = { id: 'ws1', name: 'Workspace 1' };
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockWorkspace,
      });

      const result = await repository.getById('ws1');

      expect(result).toEqual(mockWorkspace);
    });

    it('should return null if workspace does not exist', async () => {
      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      const result = await repository.getById('non-existent');

      expect(result).toBeNull();
    });
  });
});
