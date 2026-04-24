import { test, expect, SEED_TASKS } from '../fixtures/auth.fixture';
import { DashboardPage } from '../pages/dashboard.page';
import { TaskDetailPage } from '../pages/task-detail.page';

test.describe('Task CRUD Lifecycle', () => {
  test('authenticated user sees the task dashboard with seeded tasks', async ({
    authenticatedPage,
  }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();

    // Dashboard header
    await expect(dashboard.heading).toBeVisible();

    // Seed tasks should be rendered
    for (const task of SEED_TASKS) {
      await expect(authenticatedPage.getByText(task.title)).toBeVisible();
    }
  });

  test('create a new task via the form', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();

    // Wait for initial tasks to load
    await expect(authenticatedPage.getByText(SEED_TASKS[0].title)).toBeVisible();

    await dashboard.createTask('Brand new E2E task');

    // The new task should appear in the list
    await expect(authenticatedPage.getByText('Brand new E2E task')).toBeVisible();

    // The input should be cleared
    await expect(dashboard.taskInput).toHaveValue('');
  });

  test('open task detail panel and verify fields', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    const detail = new TaskDetailPage(authenticatedPage);
    await dashboard.goto();

    // Wait for tasks to render
    await expect(authenticatedPage.getByText(SEED_TASKS[0].title)).toBeVisible();

    // Click a task to open detail
    await dashboard.openTask(SEED_TASKS[0].title);
    await detail.waitForOpen();

    // Verify fields are pre-populated
    await expect(detail.titleInput).toHaveValue(SEED_TASKS[0].title);
    await expect(detail.prioritySelect).toHaveValue(SEED_TASKS[0].priority);
  });

  test('edit task title in the detail panel', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    const detail = new TaskDetailPage(authenticatedPage);
    await dashboard.goto();

    await expect(authenticatedPage.getByText(SEED_TASKS[0].title)).toBeVisible();

    // Open the first task
    await dashboard.openTask(SEED_TASKS[0].title);
    await detail.waitForOpen();

    // Edit the title
    await detail.editTitle('Updated grocery list');

    // Verify the title input reflects the change
    await expect(detail.titleInput).toHaveValue('Updated grocery list');
  });

  test('change task priority in the detail panel', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    const detail = new TaskDetailPage(authenticatedPage);
    await dashboard.goto();

    await expect(authenticatedPage.getByText(SEED_TASKS[1].title)).toBeVisible();

    await dashboard.openTask(SEED_TASKS[1].title);
    await detail.waitForOpen();

    // Change priority from medium to high
    await detail.setPriority('high');
    await expect(detail.prioritySelect).toHaveValue('high');
  });

  test('close the detail panel with the close button', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    const detail = new TaskDetailPage(authenticatedPage);
    await dashboard.goto();

    await expect(authenticatedPage.getByText(SEED_TASKS[0].title)).toBeVisible();

    await dashboard.openTask(SEED_TASKS[0].title);
    await detail.waitForOpen();

    await detail.close();

    // Panel should slide out (translate-x-full)
    await expect(detail.panel).not.toBeInViewport();
  });

  test('close the detail panel with Escape key', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    const detail = new TaskDetailPage(authenticatedPage);
    await dashboard.goto();

    await expect(authenticatedPage.getByText(SEED_TASKS[0].title)).toBeVisible();

    await dashboard.openTask(SEED_TASKS[0].title);
    await detail.waitForOpen();

    await authenticatedPage.keyboard.press('Escape');

    await expect(detail.panel).not.toBeInViewport();
  });

  test('delete a task from the detail panel', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    const detail = new TaskDetailPage(authenticatedPage);
    await dashboard.goto();

    const taskToDelete = SEED_TASKS[1].title;
    await expect(authenticatedPage.getByText(taskToDelete)).toBeVisible();

    await dashboard.openTask(taskToDelete);
    await detail.waitForOpen();

    await detail.deleteTask();

    // Task should be removed from the list
    await expect(authenticatedPage.getByText(taskToDelete)).not.toBeVisible();
  });

  test('toggle task completion from the list', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();

    const taskTitle = SEED_TASKS[0].title;
    await expect(authenticatedPage.getByText(taskTitle)).toBeVisible();

    // Toggle the task
    await dashboard.toggleTask(taskTitle);

    // The task title should now have a strikethrough style
    const titleElement = authenticatedPage
      .locator('[data-testid^="task-item-"]')
      .filter({ hasText: taskTitle })
      .locator('h3');
    await expect(titleElement).toHaveClass(/line-through/);
  });

  test('full lifecycle: create → edit → complete → delete', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    const detail = new TaskDetailPage(authenticatedPage);
    await dashboard.goto();

    // Wait for seed data to render
    await expect(authenticatedPage.getByText(SEED_TASKS[0].title)).toBeVisible();

    // 1. Create
    await dashboard.createTask('Lifecycle test task');
    await expect(authenticatedPage.getByText('Lifecycle test task')).toBeVisible();

    // 2. Edit via detail panel
    await dashboard.openTask('Lifecycle test task');
    await detail.waitForOpen();
    await detail.editTitle('Lifecycle task - edited');
    await detail.editDescription('This was edited during E2E');
    await detail.setPriority('high');
    await detail.close();

    // 3. Toggle completion
    await dashboard.toggleTask('Lifecycle task - edited');

    // 4. Delete via detail panel
    await dashboard.openTask('Lifecycle task - edited');
    await detail.waitForOpen();
    await detail.deleteTask();
    await expect(authenticatedPage.getByText('Lifecycle task - edited')).not.toBeVisible();
  });
});
