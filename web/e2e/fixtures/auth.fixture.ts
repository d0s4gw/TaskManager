import { test as base, Page } from '@playwright/test';
import { Task } from '../../../shared/task';
import { Workspace } from '../../../shared/workspace';

/**
 * Mock Firebase user returned by the intercepted auth endpoint.
 * Matches the shape that onAuthStateChanged expects.
 */
const MOCK_USER = {
  uid: 'e2e-user-123',
  email: 'e2e@taskmanager.test',
  displayName: 'E2E Tester',
  photoURL: 'https://ui-avatars.com/api/?name=E2E+Tester&background=6366f1&color=fff',
};

const MOCK_ID_TOKEN = 'e2e-mock-firebase-id-token';

/**
 * Seed tasks used for tests that expect pre-existing data.
 */
export const SEED_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Buy groceries',
    description: 'Milk, eggs, bread',
    completed: false,
    priority: 'high',
    dueDate: new Date('2026-05-01').toISOString(),
    userId: MOCK_USER.uid,
    workspaceId: `personal-${MOCK_USER.uid}`,
    createdAt: new Date('2026-04-20').toISOString(),
    updatedAt: new Date('2026-04-20').toISOString(),
    position: 0,
  },
  {
    id: 'task-2',
    title: 'Write tests',
    description: 'Add E2E tests with Playwright',
    completed: false,
    priority: 'medium',
    userId: MOCK_USER.uid,
    workspaceId: `personal-${MOCK_USER.uid}`,
    createdAt: new Date('2026-04-21').toISOString(),
    updatedAt: new Date('2026-04-21').toISOString(),
    position: 1,
  },
  {
    id: 'task-3',
    title: 'Read a book',
    completed: true,
    priority: 'low',
    userId: MOCK_USER.uid,
    workspaceId: `personal-${MOCK_USER.uid}`,
    createdAt: new Date('2026-04-19').toISOString(),
    updatedAt: new Date('2026-04-22').toISOString(),
    position: 2,
  },
];

// ---------- Internal helpers ----------

/**
 * Intercept all Firebase Identity Toolkit requests so the client
 * believes a user is signed in without hitting Google.
 */
async function mockFirebaseAuth(page: Page) {
  // Intercept the Firebase Auth REST endpoints
  await page.route('**/identitytoolkit.googleapis.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        kind: 'identitytoolkit#VerifyPasswordResponse',
        localId: MOCK_USER.uid,
        email: MOCK_USER.email,
        displayName: MOCK_USER.displayName,
        idToken: MOCK_ID_TOKEN,
        registered: true,
        refreshToken: 'e2e-refresh-token',
        expiresIn: '3600',
      }),
    }),
  );

  // Intercept the secure token service (token refresh)
  await page.route('**/securetoken.googleapis.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id_token: MOCK_ID_TOKEN,
        refresh_token: 'e2e-refresh-token',
        expires_in: '3600',
        token_type: 'Bearer',
        user_id: MOCK_USER.uid,
      }),
    }),
  );
}

/**
 * Inject a mock Firebase user into the AuthContext by evaluating a
 * script that patches `window.__E2E_MOCK_USER__`.
 *
 * The AuthContext reads this global to short-circuit onAuthStateChanged
 * when running in test mode.
 */
async function injectMockUser(page: Page) {
  await page.addInitScript({
    content: `
      window.__E2E_MOCK_USER__ = ${JSON.stringify(MOCK_USER)};
    `,
  });
}

// ---------- Task API mocking ----------

/**
 * In-memory task store scoped to a single test. Mutations from
 * POST/PUT/DELETE are reflected so subsequent GETs return the latest state.
 */
function createTaskStore(initial: Task[] = [...SEED_TASKS]) {
  let tasks = initial.map((t) => ({ ...t }));
  let nextPosition = tasks.length;

  return {
    getAll: (workspaceId?: string) => {
      if (workspaceId) {
        return tasks.filter(t => t.workspaceId === workspaceId);
      }
      return [...tasks];
    },
    create: (data: Partial<Task>): Task => {
      const task: Task = {
        id: `task-${Date.now()}`,
        title: data.title || 'Untitled',
        description: data.description,
        completed: false,
        priority: data.priority || 'none',
        dueDate: data.dueDate,
        userId: MOCK_USER.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        position: nextPosition++,
        ...data,
      };
      tasks.push(task);
      return task;
    },
    update: (id: string, updates: Partial<Task>) => {
      tasks = tasks.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t,
      );
    },
    delete: (id: string) => {
      tasks = tasks.filter((t) => t.id !== id);
    },
  };
}

function createWorkspaceStore() {
  const workspaces: Workspace[] = [];

  return {
    getAll: () => [...workspaces],
    create: (data: { name: string }): Workspace => {
      const workspace: Workspace = {
        id: `workspace-${Date.now()}`,
        name: data.name,
        ownerId: MOCK_USER.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        members: [{ userId: MOCK_USER.uid, role: 'owner', joinedAt: new Date().toISOString() }],
        memberIds: [MOCK_USER.uid],
      };
      workspaces.push(workspace);
      return workspace;
    },
  };
}

async function mockApi(
  page: Page,
  taskStore: ReturnType<typeof createTaskStore>,
  workspaceStore: ReturnType<typeof createWorkspaceStore>
) {
  await page.route('**/api/tasks**', async (route, request) => {
    const url = new URL(request.url());

    
    // GET /api/tasks
    if (request.method() === 'GET') {
      const workspaceId = url.searchParams.get('workspaceId') || undefined;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: taskStore.getAll(workspaceId),
          metadata: { timestamp: new Date().toISOString() },
        }),
      });
    }

    // POST /api/tasks
    if (request.method() === 'POST') {
      const body = request.postDataJSON();
      const task = taskStore.create(body);
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: task,
          metadata: { timestamp: new Date().toISOString() },
        }),
      });
    }

    // PUT & DELETE /api/tasks/:id
    const id = url.pathname.split('/').pop()!;
    if (id !== 'tasks') {
      if (request.method() === 'PUT') {
        const body = request.postDataJSON();
        taskStore.update(id, body);
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            metadata: { timestamp: new Date().toISOString() },
          }),
        });
      }

      if (request.method() === 'DELETE') {
        taskStore.delete(id);
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            metadata: { timestamp: new Date().toISOString() },
          }),
        });
      }
    }

    return route.continue();
  });

  // Mock Workspace API
  await page.route('**/api/workspaces**', async (route, request) => {
    const url = new URL(request.url());

    // GET /api/workspaces
    if (url.pathname === '/api/workspaces' && request.method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: workspaceStore.getAll(),
          metadata: { timestamp: new Date().toISOString() },
        }),
      });
    }

    // POST /api/workspaces
    if (url.pathname === '/api/workspaces' && request.method() === 'POST') {
      const body = request.postDataJSON();
      const workspace = workspaceStore.create(body);
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: workspace,
          metadata: { timestamp: new Date().toISOString() },
        }),
      });
    }

    // POST /api/workspaces/:id/invite
    if (url.pathname.endsWith('/invite') && request.method() === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          metadata: { timestamp: new Date().toISOString() },
        }),
      });
    }

    // POST /api/workspaces/accept/:token
    if (url.pathname.includes('/accept/') && request.method() === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { workspaceId: 'e2e-mock-workspace' },
          metadata: { timestamp: new Date().toISOString() },
        }),
      });
    }

    console.log("FALLTHROUGH", request.method(), url.href); return route.continue();
  });
}

// ---------- Exported Test Fixtures ----------

type AuthFixtures = {
  /** A page that is already "logged in" via mocked Firebase auth and API. */
  authenticatedPage: Page;
  /** The in-memory task store backing the mock API for this test. */
  taskStore: ReturnType<typeof createTaskStore>;
  /** The in-memory workspace store backing the mock API for this test. */
  workspaceStore: ReturnType<typeof createWorkspaceStore>;
};

export const test = base.extend<AuthFixtures>({
  taskStore: async ({}, use) => {
    const store = createTaskStore();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(store);
  },

  workspaceStore: async ({}, use) => {
    const store = createWorkspaceStore();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(store);
  },

  authenticatedPage: async ({ page, taskStore, workspaceStore }, use) => {
    // 1. Mock Firebase auth endpoints
    await mockFirebaseAuth(page);

    // 2. Inject mock user into the page context
    await injectMockUser(page);

    // 3. Mock the Task and Workspace API
    await mockApi(page, taskStore, workspaceStore);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    page.on("request", r => console.log("[REQ]", r.method(), r.url())); await use(page);
  },
});

export { expect } from '@playwright/test';
