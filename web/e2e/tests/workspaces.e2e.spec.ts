import { test, expect } from '../fixtures/auth.fixture';
import { WorkspacesPage } from '../pages/workspaces.page';
import { DashboardPage } from '../pages/dashboard.page';

test.describe('Workspaces & Collaboration', () => {
  test('create and switch between workspaces', async ({ authenticatedPage: page }) => {
    const workspaces = new WorkspacesPage(page);
    const dashboard = new DashboardPage(page);
    
    await workspaces.goto();
    
    // 1. Create a new workspace
    const wsName = 'E2E Team ' + Math.floor(Math.random() * 1000);
    const taskName = 'Task in ' + wsName;
    await workspaces.createWorkspace(wsName);
    
    // 2. Verify it's selected (header changes)
    await expect(page.getByRole('heading', { name: wsName })).toBeVisible();
    
    // 3. Create a task in this workspace
    await dashboard.createTask(taskName);
    await expect(page.getByText(taskName)).toBeVisible();
    
    // 4. Switch back to Personal
    await workspaces.selectWorkspace('Personal');
    await expect(page.getByRole('heading', { name: 'Personal Tasks' })).toBeVisible();
    
    // 5. Verify the task is GONE in Personal
    await expect(page.getByText(taskName)).not.toBeVisible();
    
    // 6. Switch back to Team
    await workspaces.selectWorkspace(wsName);
    await expect(page.getByText(taskName)).toBeVisible();
  });

  test('invite member dialog flow', async ({ authenticatedPage: page }) => {
    const workspaces = new WorkspacesPage(page);
    await workspaces.goto();
    
    const wsName = 'Invite Test ' + Math.floor(Math.random() * 1000);
    await workspaces.createWorkspace(wsName);
    
    // Open invite dialog
    await workspaces.openInviteDialog(wsName);
    
    // Verify dialog content
    await expect(page.getByRole('heading', { name: 'Invite Team Member' })).toBeVisible();
    await expect(page.locator('div.bg-white').getByText(wsName)).toBeVisible();
    
    // Fill email
    await page.getByPlaceholder('colleague@example.com').fill('friend@test.com');
    
    // Select role
    await page.getByRole('button', { name: 'VIEWER' }).click();
    
    // Mock the alert for invitation sent - use once to avoid double handle
    page.once('dialog', async dialog => {
      await dialog.accept();
    });
    
    // Send
    await page.getByRole('button', { name: 'Send Invitation' }).click();
    
    // Dialog should be closed
    await expect(page.getByRole('heading', { name: 'Invite Team Member' })).not.toBeVisible();
  });

  test('accept invitation landing page', async ({ authenticatedPage: page }) => {
    // Navigate directly to an invite URL
    await page.goto('/invites/mock-token?agentLogin=true');
    
    // Ensure URL is stable and segment is parsed
    await expect(page).toHaveURL(/\/invites\/mock-token/);
    await expect(page.getByText("You're Invited!")).toBeVisible();
    
    // Wait for mock user to be active
    await expect(page.getByText('agent@test.com')).toBeVisible({ timeout: 10000 });
    
    const acceptButton = page.getByRole('button', { name: 'Accept Invitation & Join' });
    await expect(acceptButton).toBeVisible();
    await expect(acceptButton).toBeEnabled();
    
    // Accept (will use mocked response)
    await acceptButton.click();
    
    // Success message - should appear after API call
    await expect(page.getByText('Welcome aboard!'), { timeout: 15000 }).toBeVisible();
    
    // Redirection to dashboard
    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });
  });
});
