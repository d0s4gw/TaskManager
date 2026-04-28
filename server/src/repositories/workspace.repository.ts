import { BaseRepository } from './base.repository';
import { Workspace, WorkspaceMember } from '@shared/workspace';
import * as admin from 'firebase-admin';

export interface IWorkspaceRepository {
  getByUserId(userId: string): Promise<Workspace[]>;
  create(workspace: Workspace): Promise<void>;
  addMember(workspaceId: string, member: WorkspaceMember): Promise<void>;
  getById(id: string): Promise<Workspace | null>;
  delete(id: string): Promise<void>;
}

export class WorkspaceRepository extends BaseRepository<Workspace> implements IWorkspaceRepository {
  constructor() {
    super('workspaces');
  }

  async getByUserId(userId: string): Promise<Workspace[]> {
    // Find workspaces where the user is in the members array
    const snapshot = await this.collection
      .where('members', 'array-contains', { userId }) // This might need a more specific query if we store objects
      .get();
    
    // Firestore array-contains with objects requires an exact match.
    // If we want to find any role, we might need a different structure or multiple queries.
    // However, for simplicity in this MVP, we'll assume members is a sub-collection or we use a map.
    // Let's refine the model: if we use an array of objects, we have to match the whole object.
    // Alternative: store memberIds as a separate array for easy querying.
    
    // Let's stick to a more queryable pattern:
    const query = await this.collection
      .where('memberIds', 'array-contains', userId)
      .get();
      
    return query.docs.map(doc => doc.data() as Workspace);
  }

  async create(workspace: Workspace): Promise<void> {
    // Add memberIds array for easier querying
    const workspaceWithMemberIds = {
      ...workspace,
      memberIds: workspace.members.map(m => m.userId)
    };
    await this.collection.doc(workspace.id).set(workspaceWithMemberIds as any);
  }

  async addMember(workspaceId: string, member: WorkspaceMember): Promise<void> {
    await this.collection.doc(workspaceId).update({
      members: admin.firestore.FieldValue.arrayUnion(member) as any,
      memberIds: admin.firestore.FieldValue.arrayUnion(member.userId) as any,
      updatedAt: new Date().toISOString()
    });
  }
}
