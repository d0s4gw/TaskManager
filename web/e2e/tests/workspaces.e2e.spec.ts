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
    const dialog = page.getByTestId('invite-member-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(wsName)).toBeVisible();
    
    // Fill email
    const emailInput = page.getByTestId('invite-email-input');
    await emailInput.fill('friend@test.com');
    
    // Select role
    await page.getByTestId('role-button-viewer').click();
    
    // Send - wait for button to be enabled (in case of slow re-renders)
    const sendButton = page.getByTestId('send-invitation-button');
    await expect(sendButton).toBeEnabled();
    await sendButton.click();
    
    // Dialog should be closed (or show success state)
    // The current implementation stays open to show the token if a token is returned.
    // However, the mock returns success but no token, which causes it to close.
    await expect(page.getByTestId('invite-member-dialog')).not.toBeVisible();
  });

  test('accept invitation landing page', async ({ authenticatedPage: page }) => {
    // Navigate directly to an invite URL
    await page.goto('/invites?token=mock-token&agentLogin=true');
    
    // Ensure URL is stable
    await expect(page).toHaveURL(/token=mock-token/);
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

  test('delete a workspace', async ({ authenticatedPage: page }) => {
    const workspaces = new WorkspacesPage(page);
    await workspaces.goto();
    
    const wsName = 'Delete Me ' + Math.floor(Math.random() * 1000);
    await workspaces.createWorkspace(wsName);
    
    // Verify it exists in switcher
    await expect(page.getByRole('button', { name: wsName })).toBeVisible();
    
    // Hover over the workspace first to make the button visible
    await page.getByRole('button', { name: wsName }).hover();
    const deleteButton = page.getByRole('button', { name: 'Delete Workspace' });
    await expect(deleteButton).toBeVisible();
    
    // Mock the confirmation dialog
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain(`Are you sure you want to delete "${wsName}"?`);
      await dialog.accept();
    });
    
    await deleteButton.click();
    
    // Verify it's GONE
    await expect(page.getByRole('button', { name: wsName })).not.toBeVisible();
    
    // Verify we are back on Personal (header should say Personal Tasks)
    await expect(page.getByRole('heading', { name: 'Personal Tasks' })).toBeVisible();
  });
});
