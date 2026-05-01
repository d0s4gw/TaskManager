import { Router, Response } from 'express';
import { AuthRequest, verifyToken } from '../middleware/auth';
import { IUserStatsRepository, UserStatsRepository } from '../repositories/user-stats.repository';
import { InProcessUserStatsRepository } from '../repositories/in-process-user-stats.repository';
import { GamificationService } from '../services/gamification.service';
import { APIResponse } from '@shared/api';
import logger from '../logger';

const router = Router();
const useMockRepo = process.env.NODE_ENV === 'development';

let userStatsRepository: IUserStatsRepository;
if (useMockRepo) {
  const mockRepo = InProcessUserStatsRepository.getInstance();
  mockRepo.seed('e2e-user-123');
  userStatsRepository = mockRepo;
} else {
  userStatsRepository = new UserStatsRepository();
}

const gamificationService = new GamificationService(userStatsRepository);

router.use(verifyToken);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const stats = await gamificationService.getStats(userId);
    
    const response: APIResponse<any> = {
      success: true,
      data: stats,
    };
    res.json(response);
  } catch (error) {
    logger.error('Error fetching stats', {
      requestId: req.requestId,
      userId: (req as AuthRequest).user?.uid,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, error: { message: 'Internal Server Error' } });
  }
});

export default router;
