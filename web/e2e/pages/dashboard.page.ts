import { Locator, Page, expect } from '@playwright/test';

/**
 * Page Object Model for the authenticated dashboard.
 * Encapsulates selectors and common interactions with the task list UI.
 */
export class DashboardPage {
  readonly page: Page;

  // Header
  readonly heading: Locator;
  readonly logoutButton: Locator;

  // Task Form
  readonly taskInput: Locator;
  readonly addButton: Locator;

  // Task List
  readonly taskItems: Locator;
  readonly emptyState: Locator;

  // Error banner
  readonly errorBanner: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Personal Tasks' });
    this.logoutButton = page.getByTitle('Log Out');

    this.taskInput = page.getByPlaceholder('What needs to be done?');
    this.addButton = page.locator('form button[type="submit"]');

    this.taskItems = page.locator('[data-testid^="task-item-"]');
    this.emptyState = page.getByText('No tasks yet');

    this.errorBanner = page.locator('[data-testid="error-banner"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  /** Create a task via the form and wait for it to appear in the list. */
  async createTask(title: string) {
    await this.taskInput.fill(title);
    await this.taskInput.press('Enter');
    // Wait for the task to appear
    await expect(this.page.getByText(title)).toBeVisible({ timeout: 5000 });
  }

  /** Get the Nth task item (0-indexed). */
  taskAt(index: number): Locator {
    return this.page.locator(`[data-testid="task-item-${index}"]`);
  }

  /** Click a task to open the detail panel. */
  async openTask(title: string) {
    await this.page.getByText(title).click();
  }

  /** Get all visible task titles in order. */
  async getTaskTitles(): Promise<string[]> {
    const items = this.taskItems;
    const count = await items.count();
    const titles: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).locator('h3').textContent();
      if (text) titles.push(text.trim());
    }
    return titles;
  }

  /** Toggle the completion checkbox on a specific task by title. */
  async toggleTask(title: string) {
    const task = this.taskItems.filter({ hasText: title });
    await task.getByRole('button', { name: /Mark as/ }).click();
  }

  /** Delete a task by clicking the trash icon. */
  async deleteTask(title: string) {
    const task = this.taskItems.filter({ hasText: title });
    // The delete button is hidden until hover — force it visible
    await task.getByRole('button', { name: 'Delete task' }).click({ force: true });
  }
}
