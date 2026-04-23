import { BaseRepository } from './base.repository';
import * as admin from 'firebase-admin';

// Concrete implementation for testing
class TestRepository extends BaseRepository<{ id: string; name: string }> {
  constructor() {
    super('test-collection');
  }
}

const mockDoc = {
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn(() => mockDoc),
  get: jest.fn(),
};

jest.mock('firebase-admin', () => ({
  firestore: jest.fn(() => mockFirestore),
}));

describe('BaseRepository', () => {
  let repository: TestRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new TestRepository();
  });

  describe('getById', () => {
    it('should return data if document exists', async () => {
      const data = { id: '1', name: 'Test' };
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => data,
      });

      const result = await repository.getById('1');
      expect(result).toEqual(data);
    });

    it('should return null if document does not exist', async () => {
      mockDoc.get.mockResolvedValue({ exists: false });
      const result = await repository.getById('1');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should call set with data', async () => {
      const data = { id: '1', name: 'Test' };
      await repository.create(data);
      expect(mockDoc.set).toHaveBeenCalledWith(data);
    });
  });

  describe('update', () => {
    it('should call update with partial data', async () => {
      const data = { name: 'Updated' };
      await repository.update('1', data);
      expect(mockDoc.update).toHaveBeenCalledWith(data);
    });
  });

  describe('delete', () => {
    it('should call delete on document', async () => {
      await repository.delete('1');
      expect(mockDoc.delete).toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('should return all documents in collection', async () => {
      const data = [{ id: '1', name: 'A' }, { id: '2', name: 'B' }];
      mockFirestore.get.mockResolvedValue({
        docs: data.map(d => ({ data: () => d })),
      });

      const result = await repository.list();
      expect(result).toEqual(data);
    });
  });
});
