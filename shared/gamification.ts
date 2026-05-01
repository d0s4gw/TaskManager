export interface UserStats {
  id: string; // Document ID (usually same as userId)
  userId: string;
  points: number;
  level: number;
  streakDays: number;
  lastCompletionDate?: string; // ISO format
  totalTasksCompleted: number;
  updatedAt: string;
}

export const LEVEL_MAP = {
  POINTS_PER_LEVEL: 100,
  TASK_COMPLETION_POINTS: 10,
  SUBTASK_COMPLETION_POINTS: 2,
};

export function calculateLevel(points: number): number {
  return Math.floor(points / LEVEL_MAP.POINTS_PER_LEVEL) + 1;
}

export function getProgressToNextLevel(points: number): number {
  return points % LEVEL_MAP.POINTS_PER_LEVEL;
}
