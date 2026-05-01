import { BaseRepository } from './base.repository';
import { UserStats } from '@shared/gamification';

export interface IUserStatsRepository {
  getById(userId: string): Promise<UserStats | null>;
  create(stats: UserStats): Promise<void>;
  update(userId: string, stats: Partial<UserStats>): Promise<void>;
}

export class UserStatsRepository extends BaseRepository<UserStats> implements IUserStatsRepository {
  constructor() {
    super('user_stats');
  }
}
