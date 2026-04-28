import { InProcessRepository } from './in-process.repository';
import { Workspace, WorkspaceMember } from '@shared/workspace';
import { IWorkspaceRepository } from './workspace.repository';

export class InProcessWorkspaceRepository extends InProcessRepository<Workspace> implements IWorkspaceRepository {
  async getByUserId(userId: string): Promise<Workspace[]> {
    return Array.from(this.items.values())
      .filter(ws => ws.memberIds.includes(userId));
  }

  async addMember(workspaceId: string, member: WorkspaceMember): Promise<void> {
    const ws = await this.getById(workspaceId);
    if (ws) {
      if (!ws.memberIds.includes(member.userId)) {
        ws.members.push(member);
        ws.memberIds.push(member.userId);
        ws.updatedAt = new Date().toISOString();
        this.items.set(workspaceId, ws);
      }
    }
  }
}
