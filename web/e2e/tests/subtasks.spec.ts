import { test, expect, SEED_TASKS } from '../fixtures/auth.fixture';
import { DashboardPage } from '../pages/dashboard.page';
import { TaskDetailPage } from '../pages/task-detail.page';

test.describe('Recursive Subtasks', () => {
  test('can add and edit subtasks', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    const detail = new TaskDetailPage(authenticatedPage);
    await dashboard.goto();

    // Open a task
    await dashboard.openTask(SEED_TASKS[0].title);
    await detail.waitForOpen();

    // Add a subtask
    await detail.addSubtask();
    await expect(authenticatedPage.getByText('Untitled Subtask')).toBeVisible();

    // Edit its title
    await detail.editSubtaskTitle('Untitled Subtask', 'E2E Subtask 1');
    await expect(authenticatedPage.getByText('E2E Subtask 1')).toBeVisible();

    // Toggle completion
    await detail.toggleSubtask('E2E Subtask 1');
    
    // Verify progress indicator (1 / X)
    const progress = authenticatedPage.locator('span', { hasText: '1 /' });
    await expect(progress).toBeVisible();

    // Reload and verify persistence
    await authenticatedPage.reload();
    await dashboard.openTask(SEED_TASKS[0].title);
    await detail.waitForOpen();
    await expect(authenticatedPage.getByText('E2E Subtask 1')).toBeVisible();
  });

  test('supports nested subtasks (recursive)', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    const detail = new TaskDetailPage(authenticatedPage);
    await dashboard.goto();

    await dashboard.openTask(SEED_TASKS[1].title);
    await detail.waitForOpen();

    // Add a root subtask
    await detail.addSubtask();
    await detail.editSubtaskTitle('Untitled Subtask', 'Parent Sub');

    // Add a child subtask to the parent subtask
    const parentRow = authenticatedPage.locator('.group').filter({ hasText: 'Parent Sub' });
    await parentRow.getByTitle('Add subtask').click();
    
    // Type child title
    const childInput = authenticatedPage.locator('input[placeholder="Subtask title..."]');
    await childInput.fill('Child Sub');
    await childInput.press('Enter');

    await expect(authenticatedPage.getByText('Child Sub')).toBeVisible();

    // Verify progress in list view
    await detail.close();
    const taskCard = authenticatedPage.locator('[data-testid^="task-item-"]').filter({ hasText: SEED_TASKS[1].title });
    // Seed tasks might have subtasks, so we check for the badge
    await expect(taskCard.locator('span', { hasText: '/' })).toBeVisible();
  });
});
