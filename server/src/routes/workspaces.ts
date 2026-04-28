import { Router, Response } from 'express';
import { AuthRequest, verifyToken } from '../middleware/auth';
import { IWorkspaceRepository, WorkspaceRepository } from '../repositories/workspace.repository';
import { IInvitationRepository, InvitationRepository } from '../repositories/invitation.repository';
import { InProcessWorkspaceRepository } from '../repositories/in-process-workspace.repository';
import { InProcessInvitationRepository } from '../repositories/in-process-invitation.repository';
import { UserRepository } from '../repositories/user.repository';
import { createWorkspaceSchema, inviteMemberSchema } from '@shared/validation';
import { APIResponse } from '@shared/api';
import { Workspace } from '@shared/workspace';
import { Invitation } from '@shared/invitation';
import logger from '../logger';
import { ZodError } from 'zod';
import * as crypto from 'crypto';

const router = Router();

const useMockRepo = process.env.NODE_ENV === 'development';
let workspaceRepository: IWorkspaceRepository;
let invitationRepository: IInvitationRepository;

if (useMockRepo) {
  workspaceRepository = new InProcessWorkspaceRepository();
  invitationRepository = new InProcessInvitationRepository();
  
  // Seed a mock workspace for E2E
  workspaceRepository.create({
    id: 'e2e-mock-workspace',
    name: 'E2E Workspace',
    ownerId: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    members: [],
    memberIds: []
  });

  // Seed a mock invitation for E2E testing
  invitationRepository.create({
    id: 'e2e-mock-invitation',
    token: 'mock-token',
    workspaceId: 'e2e-mock-workspace',
    workspaceName: 'E2E Workspace',
    email: 'agent@test.com',
    role: 'editor',
    inviterId: 'system',
    inviterName: 'System',
    status: 'pending',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 100000000).toISOString()
  });

  logger.info('Using In-Memory Workspace & Invitation Repositories');
} else {
  workspaceRepository = new WorkspaceRepository();
  invitationRepository = new InvitationRepository();
}

const userRepository = new UserRepository();

router.use(verifyToken);

// Get all workspaces for the logged-in user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const workspaces = await workspaceRepository.getByUserId(userId);
    res.json({ success: true, data: workspaces });
  } catch (error) {
    logger.error('Error fetching workspaces', { error: String(error) });
    res.status(500).json({ success: false, error: { message: 'Internal Server Error' } });
  }
});

// Create a workspace
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const { name } = createWorkspaceSchema.parse(req.body);
    const now = new Date().toISOString();
    
    const newWorkspace: Workspace = {
      id: crypto.randomUUID(),
      name,
      ownerId: userId,
      createdAt: now,
      updatedAt: now,
      members: [{
        userId,
        role: 'owner',
        joinedAt: now
      }],
      memberIds: [userId]
    };

    await workspaceRepository.create(newWorkspace);
    res.status(201).json({ success: true, data: newWorkspace });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, error: { message: 'Validation Failed', details: error.issues } });
    }
    logger.error('Error creating workspace', { error: String(error) });
    res.status(500).json({ success: false, error: { message: 'Internal Server Error' } });
  }
});

// Invite a member
router.post('/:id/invite', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const workspaceId = req.params.id as string;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const workspace = await workspaceRepository.getById(workspaceId);
    if (!workspace || !workspace.memberIds.includes(userId)) {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }

    const { email, role } = inviteMemberSchema.parse(req.body);
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const invitation: Invitation = {
      id: crypto.randomUUID(),
      workspaceId,
      workspaceName: workspace.name,
      email,
      role: role as any,
      token: crypto.randomBytes(32).toString('hex'),
      inviterId: userId,
      inviterName: req.user?.name || 'Unknown User',
      status: 'pending',
      createdAt: now,
      expiresAt
    };

    await invitationRepository.create(invitation);
    
    // In a real app, send an email here
    logger.info('Invitation created', { invitationId: invitation.id, token: invitation.token });

    res.json({ success: true, data: { invitationId: invitation.id, token: invitation.token } });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, error: { message: 'Validation Failed', details: error.issues } });
    }
    logger.error('Error inviting member', { error: String(error) });
    res.status(500).json({ success: false, error: { message: 'Internal Server Error' } });
  }
});

// Accept invitation
router.post('/accept/:token', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const token = req.params.token as string;
    logger.info('Accepting invitation', { token, userId });
    
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const invitation = await invitationRepository.getByToken(token);
    if (!invitation || invitation.status !== 'pending') {
      return res.status(404).json({ success: false, error: { message: 'Invitation not found or already processed' } });
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      await invitationRepository.updateStatus(invitation.id, 'expired');
      return res.status(400).json({ success: false, error: { message: 'Invitation expired' } });
    }

    // Add member to workspace
    await workspaceRepository.addMember(invitation.workspaceId, {
      userId,
      role: invitation.role,
      joinedAt: new Date().toISOString()
    });

    await invitationRepository.updateStatus(invitation.id, 'accepted');

    res.json({ success: true, data: { workspaceId: invitation.workspaceId } });
  } catch (error) {
    logger.error('Error accepting invitation', { error: String(error) });
    res.status(500).json({ success: false, error: { message: 'Internal Server Error' } });
  }
});

export default router;
