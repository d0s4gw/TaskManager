import { InProcessRepository } from './in-process.repository';
import { UserStats } from '@shared/gamification';
import { IUserStatsRepository } from './user-stats.repository';

export class InProcessUserStatsRepository extends InProcessRepository<UserStats> implements IUserStatsRepository {
  private static instance: InProcessUserStatsRepository;

  static getInstance(): InProcessUserStatsRepository {
    if (!InProcessUserStatsRepository.instance) {
      InProcessUserStatsRepository.instance = new InProcessUserStatsRepository();
    }
    return InProcessUserStatsRepository.instance;
  }

  seed(userId: string) {
    const now = new Date().toISOString();
    const mockStats: UserStats = {
      id: userId, // InProcessRepository uses 'id' field
      userId: userId,
      points: 450,
      level: 5,
      streakDays: 3,
      totalTasksCompleted: 42,
      updatedAt: now,
      lastCompletionDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    };
    this.items.set(userId, mockStats);
  }
}
