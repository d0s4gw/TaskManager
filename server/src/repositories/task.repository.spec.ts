import { TaskRepository } from './task.repository';
import * as admin from 'firebase-admin';

const mockDoc = {
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockBatch = {
  delete: jest.fn(),
  commit: jest.fn(),
};

const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  get: jest.fn(),
  doc: jest.fn(() => mockDoc),
  batch: jest.fn(() => mockBatch),
};

jest.mock('firebase-admin', () => ({
  firestore: jest.fn(() => mockFirestore),
}));

describe('TaskRepository', () => {
  let repository: TaskRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new TaskRepository();
  });

  describe('getByUserId', () => {
    it('should fetch tasks for a specific user', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', userId: 'user1' },
        { id: '2', title: 'Task 2', userId: 'user1' },
      ];
      mockFirestore.get.mockResolvedValue({
        docs: mockTasks.map(t => ({ data: () => t })),
      });

      const result = await repository.getByUserId('user1');

      expect(mockFirestore.collection).toHaveBeenCalledWith('tasks');
      expect(mockFirestore.where).toHaveBeenCalledWith('userId', '==', 'user1');
      expect(result).toEqual(mockTasks);
    });
  });

  describe('createWithId', () => {
    it('should create a task with a generated id', async () => {
      const taskData = { title: 'New Task', userId: 'user1' };
      // Override doc mock for this test to return id
      const mockDocRef = { id: 'generated-id', set: jest.fn() };
      mockFirestore.doc.mockReturnValueOnce(mockDocRef as any);
      // Mock the position query returning empty (no existing tasks)
      mockFirestore.get.mockResolvedValueOnce({ empty: true, docs: [] });

      const result = await repository.createWithId(taskData as any);

      expect(result).toEqual({ ...taskData, id: 'generated-id', position: 0 });
      expect(mockDocRef.set).toHaveBeenCalledWith({ ...taskData, id: 'generated-id', position: 0 });
    });
  });

  describe('getByIdAndUserId', () => {
    it('should return task if it belongs to user', async () => {
      const mockTask = { id: '1', title: 'Task 1', userId: 'user1' };
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockTask,
      });

      const result = await repository.getByIdAndUserId('1', 'user1');

      expect(result).toEqual(mockTask);
    });

    it('should return null if task does not belong to user', async () => {
      const mockTask = { id: '1', title: 'Task 1', userId: 'other-user' };
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockTask,
      });

      const result = await repository.getByIdAndUserId('1', 'user1');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update the document in firestore', async () => {
      const updates = { title: 'Updated' };
      await repository.update('1', updates);
      expect(mockFirestore.doc).toHaveBeenCalledWith('1');
      expect(mockDoc.update).toHaveBeenCalledWith(updates);
    });
  });

  describe('delete', () => {
    it('should delete the document from firestore', async () => {
      await repository.delete('1');
      expect(mockFirestore.doc).toHaveBeenCalledWith('1');
      expect(mockDoc.delete).toHaveBeenCalled();
    });
  });

  describe('deleteByWorkspaceId', () => {
    it('should delete all tasks in a workspace using batch', async () => {
      const mockDocs = [
        { ref: 'ref1' },
        { ref: 'ref2' },
      ];
      mockFirestore.get.mockResolvedValue({
        empty: false,
        docs: mockDocs,
      });

      await repository.deleteByWorkspaceId('ws1');

      expect(mockFirestore.where).toHaveBeenCalledWith('workspaceId', '==', 'ws1');
      expect(mockBatch.delete).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('should do nothing if no tasks found', async () => {
      mockFirestore.get.mockResolvedValue({ empty: true });
      await repository.deleteByWorkspaceId('ws1');
      expect(mockBatch.commit).not.toHaveBeenCalled();
    });
  });
});
