import { Page, Locator } from '@playwright/test';

export class WorkspacesPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly createButton: Locator;
  readonly personalButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('aside');
    this.createButton = this.sidebar.locator('button[title="Create Workspace"]');
    this.personalButton = this.sidebar.getByText('Personal');
  }

  async goto() {
    await this.page.goto('/?agentLogin=true');
  }

  async createWorkspace(name: string) {
    // Mock the prompt before clicking
    this.page.once('dialog', async dialog => {
      await dialog.accept(name);
    });
    await this.createButton.click();
  }

  async selectWorkspace(name: string) {
    await this.sidebar.getByText(name).click();
  }

  async openInviteDialog(workspaceName: string) {
    const wsItem = this.sidebar.locator('div.group').filter({ hasText: workspaceName });
    await wsItem.locator('button[title="Invite Members"]').click();
  }
}
