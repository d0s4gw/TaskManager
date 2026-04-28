import { InProcessRepository } from './in-process.repository';
import { Invitation, InvitationStatus } from '@shared/invitation';
import { IInvitationRepository } from './invitation.repository';

export class InProcessInvitationRepository extends InProcessRepository<Invitation> implements IInvitationRepository {
  async getByToken(token: string): Promise<Invitation | null> {
    const items = Array.from(this.items.values());
    console.log('[InProcessInvitationRepo] getByToken', { token, availableTokens: items.map(i => i.token) });
    return items.find(inv => inv.token === token) || null;
  }

  async updateStatus(id: string, status: InvitationStatus): Promise<void> {
    const inv = await this.getById(id);
    if (inv) {
      inv.status = status;
      this.items.set(id, inv);
    }
  }
}
