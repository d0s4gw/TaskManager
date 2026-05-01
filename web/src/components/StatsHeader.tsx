"use client";

import React, { useEffect, useState } from 'react';
import { Flame, Trophy } from 'lucide-react';
import { getProgressToNextLevel, LEVEL_MAP } from '../../../shared/gamification';
import type { UserStats } from '../../../shared/gamification';
import { TaskApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function StatsHeader() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const api = new TaskApi(() => user.getIdToken());
    const fetchStats = async () => {
      try {
        const data = await api.getStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    
    // Poll for stats updates occasionally or we could use a custom event
    const interval = setInterval(fetchStats, 10000); 
    return () => clearInterval(interval);
  }, [user]);

  if (isLoading || !stats) return null;

  const progress = getProgressToNextLevel(stats.points);
  const progressPercent = (progress / LEVEL_MAP.POINTS_PER_LEVEL) * 100;

  return (
    <div className="flex items-center gap-6 px-4 py-2 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      {/* Level & XP */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/20 text-white font-bold text-lg">
          {stats.level}
        </div>
        <div className="flex flex-col gap-1 w-24 sm:w-32">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <span>Level {stats.level}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-1000 ease-out rounded-full" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

      {/* Streak */}
      <div className="flex items-center gap-2 group cursor-help" title="Consecutive days of productivity">
        <div className={`p-2 rounded-lg transition-colors ${stats.streakDays > 0 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'}`}>
          <Flame size={18} className={stats.streakDays > 0 ? 'animate-pulse' : ''} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">{stats.streakDays}</span>
          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-tighter">Day Streak</span>
        </div>
      </div>

      <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

      {/* Total Completed */}
      <div className="flex items-center gap-2 hidden md:flex">
        <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30">
          <Trophy size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">{stats.totalTasksCompleted}</span>
          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-tighter">Completed</span>
        </div>
      </div>
    </div>
  );
}
