import { BaseRepository } from './base.repository';
import { Invitation, InvitationStatus } from '@shared/invitation';

export interface IInvitationRepository {
  getByToken(token: string): Promise<Invitation | null>;
  updateStatus(id: string, status: InvitationStatus): Promise<void>;
  create(invitation: Invitation): Promise<void>;
}

export class InvitationRepository extends BaseRepository<Invitation> implements IInvitationRepository {
  constructor() {
    super('invitations');
  }

  async getByToken(token: string): Promise<Invitation | null> {
    const snapshot = await this.collection
      .where('token', '==', token)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as Invitation;
  }

  async updateStatus(id: string, status: InvitationStatus): Promise<void> {
    await this.update(id, { status });
  }
}
