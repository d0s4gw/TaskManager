import { Locator, Page } from '@playwright/test';

/**
 * Page Object Model for the task detail slide-over panel.
 */
export class TaskDetailPage {
  readonly page: Page;

  readonly panel: Locator;
  readonly closeButton: Locator;

  // Form fields
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly prioritySelect: Locator;
  readonly dueDateInput: Locator;

  // Actions
  readonly toggleButton: Locator;
  readonly deleteButton: Locator;

  // Status
  readonly savingIndicator: Locator;
  readonly savedIndicator: Locator;
  readonly createdDate: Locator;

  constructor(page: Page) {
    this.page = page;

    this.panel = page.locator('[data-testid="task-detail-panel"]');
    this.closeButton = page.locator('[data-testid="task-detail-close"]');

    this.titleInput = this.panel.getByPlaceholder('Task title');
    this.descriptionInput = this.panel.getByPlaceholder('Add more details about this task...');
    this.prioritySelect = this.panel.locator('select');
    this.dueDateInput = this.panel.locator('input[type="date"]');

    this.toggleButton = this.panel.locator('[data-testid="task-detail-toggle"]');
    this.deleteButton = this.panel.getByText('Delete Task');

    this.savingIndicator = this.panel.getByText('Saving...');
    this.savedIndicator = this.panel.getByText('Saved');
    this.createdDate = this.panel.locator('[data-testid="task-detail-created"]');
  }

  async waitForOpen() {
    await this.panel.waitFor({ state: 'visible' });
  }

  async close() {
    await this.closeButton.click();
  }

  async editTitle(newTitle: string) {
    await this.titleInput.fill(newTitle);
    await this.titleInput.blur();
  }

  async editDescription(text: string) {
    await this.descriptionInput.fill(text);
    await this.descriptionInput.blur();
  }

  async setPriority(priority: 'none' | 'low' | 'medium' | 'high') {
    await this.prioritySelect.selectOption(priority);
  }

  async setDueDate(date: string) {
    await this.dueDateInput.fill(date);
  }

  async toggleCompletion() {
    await this.toggleButton.click();
  }

  async deleteTask() {
    // The component uses window.confirm — auto-accept it
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.deleteButton.click();
  }
}
