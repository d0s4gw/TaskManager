import { InvitationRepository } from './invitation.repository';
import * as admin from 'firebase-admin';

const mockDoc = {
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
};

const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  get: jest.fn(),
  doc: jest.fn(() => mockDoc),
};

jest.mock('firebase-admin', () => ({
  firestore: jest.fn(() => mockFirestore),
}));

describe('InvitationRepository', () => {
  let repository: InvitationRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new InvitationRepository();
  });

  describe('getByToken', () => {
    it('should find an invitation by token', async () => {
      const mockInvitation = { id: 'inv1', token: 'token123', status: 'pending' };
      mockFirestore.get.mockResolvedValue({
        empty: false,
        docs: [{ data: () => mockInvitation, id: 'inv1' }],
      });

      const result = await repository.getByToken('token123');

      expect(mockFirestore.collection).toHaveBeenCalledWith('invitations');
      expect(mockFirestore.where).toHaveBeenCalledWith('token', '==', 'token123');
      expect(result).toEqual(mockInvitation);
    });

    it('should return null if token not found', async () => {
      mockFirestore.get.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await repository.getByToken('invalid');

      expect(result).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update invitation status', async () => {
      await repository.updateStatus('inv1', 'accepted');

      expect(mockFirestore.doc).toHaveBeenCalledWith('inv1');
      expect(mockDoc.update).toHaveBeenCalledWith({ status: 'accepted' });
    });
  });
});
