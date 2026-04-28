import { WorkspaceRole } from './workspace';

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface Invitation {
  id: string;
  workspaceId: string;
  workspaceName: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  inviterId: string;
  inviterName: string;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
}
