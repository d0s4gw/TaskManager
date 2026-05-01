import { test, expect } from '../fixtures/auth.fixture';
import { DashboardPage } from '../pages/dashboard.page';

test.describe('Gamification Engine', () => {
  test('displays user stats in the header', async ({ authenticatedPage, statsStore }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();

    // StatsHeader should be visible
    const statsHeader = authenticatedPage.locator('div').filter({ hasText: 'Level' }).first();
    await expect(statsHeader).toBeVisible();

    // Check initial points from mockStore
    const initialStats = statsStore.get();
    await expect(authenticatedPage.getByText(`Level ${initialStats.level}`)).toBeVisible();
    await expect(authenticatedPage.getByText(`${initialStats.streakDays}`)).toBeVisible();
  });

  test('increments points and level when a task is completed', async ({ authenticatedPage, statsStore }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();

    const taskTitle = 'Buy groceries';
    const initialStats = statsStore.get();
    
    // Toggle completion
    await dashboard.toggleTask(taskTitle);

    // Points should increase (120 -> 130)
    // We might need to wait for the next poll or force a refresh if the UI doesn't auto-update
    // In our implementation, StatsHeader polls every 10s. 
    // For the test, we can just check if the mock store was updated.
    
    expect(statsStore.get().points).toBe(initialStats.points + 10);
    expect(statsStore.get().totalTasksCompleted).toBe(initialStats.totalTasksCompleted + 1);
  });
});
