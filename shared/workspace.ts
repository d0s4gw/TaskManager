export type WorkspaceRole = 'owner' | 'editor' | 'viewer';

export interface WorkspaceMember {
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  members: WorkspaceMember[];
  memberIds: string[];
}

export interface CreateWorkspaceDTO {
  name: string;
}
