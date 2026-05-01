import { IUserStatsRepository } from '../repositories/user-stats.repository';
import { UserStats, LEVEL_MAP, calculateLevel } from '@shared/gamification';
import logger from '../logger';

export class GamificationService {
  constructor(private statsRepository: IUserStatsRepository) {}

  async getStats(userId: string): Promise<UserStats> {
    try {
      let stats = await this.statsRepository.getById(userId);
      if (!stats) {
        stats = await this.initializeStats(userId);
      }
      return stats;
    } catch (error) {
      logger.error('Error in GamificationService.getStats', { userId, error: error instanceof Error ? error.stack : String(error) });
      throw error;
    }
  }

  async initializeStats(userId: string): Promise<UserStats> {
    const now = new Date().toISOString();
    const stats: UserStats = {
      id: userId,
      userId,
      points: 0,
      level: 1,
      streakDays: 0,
      totalTasksCompleted: 0,
      updatedAt: now,
    };
    await this.statsRepository.create(stats);
    return stats;
  }

  async awardPoints(userId: string, type: 'task' | 'subtask'): Promise<UserStats> {
    const stats = await this.getStats(userId);
    const now = new Date();
    const nowIso = now.toISOString();
    
    const pointsToAdd = type === 'task' ? LEVEL_MAP.TASK_COMPLETION_POINTS : LEVEL_MAP.SUBTASK_COMPLETION_POINTS;
    const newPoints = stats.points + pointsToAdd;
    const newLevel = calculateLevel(newPoints);
    
    let newStreak = stats.streakDays;
    const lastDate = stats.lastCompletionDate ? new Date(stats.lastCompletionDate) : null;
    
    if (!lastDate) {
      newStreak = 1;
    } else {
      const diffTime = now.getTime() - lastDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays >= 1 && diffDays < 2) {
        // Completed on the next day
        newStreak += 1;
      } else if (diffDays >= 2) {
        // Missed a day
        newStreak = 1;
      }
      // If diffDays < 1, same day completion, streak stays same
    }

    const updates: Partial<UserStats> = {
      points: newPoints,
      level: newLevel,
      streakDays: newStreak,
      totalTasksCompleted: stats.totalTasksCompleted + 1,
      lastCompletionDate: nowIso,
      updatedAt: nowIso,
    };

    await this.statsRepository.update(userId, updates);
    logger.info('Awarded points', { userId, type, pointsAdded: pointsToAdd, newTotal: newPoints });
    
    return { ...stats, ...updates };
  }
}
