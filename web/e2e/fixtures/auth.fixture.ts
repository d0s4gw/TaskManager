import { test as base, Page } from '@playwright/test';
import { Task } from '../../../shared/task';

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
    getAll: () => [...tasks],
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

async function mockTaskApi(page: Page, store: ReturnType<typeof createTaskStore>) {
  // GET /api/tasks
  await page.route('**/api/tasks', async (route, request) => {
    if (request.method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: store.getAll(),
          metadata: { timestamp: new Date().toISOString() },
        }),
      });
    }

    if (request.method() === 'POST') {
      const body = request.postDataJSON();
      const task = store.create(body);
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

    return route.continue();
  });

  // PUT & DELETE /api/tasks/:id
  await page.route('**/api/tasks/*', async (route, request) => {
    const url = new URL(request.url());
    const id = url.pathname.split('/').pop()!;

    if (request.method() === 'PUT') {
      const body = request.postDataJSON();
      store.update(id, body);
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
      store.delete(id);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          metadata: { timestamp: new Date().toISOString() },
        }),
      });
    }

    return route.continue();
  });
}

// ---------- Exported Test Fixtures ----------

type AuthFixtures = {
  /** A page that is already "logged in" via mocked Firebase auth and API. */
  authenticatedPage: Page;
  /** The in-memory task store backing the mock API for this test. */
  taskStore: ReturnType<typeof createTaskStore>;
};

export const test = base.extend<AuthFixtures>({
  taskStore: async ({}, use) => {
    const store = createTaskStore();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(store);
  },

  authenticatedPage: async ({ page, taskStore }, use) => {
    // 1. Mock Firebase auth endpoints
    await mockFirebaseAuth(page);

    // 2. Inject mock user into the page context
    await injectMockUser(page);

    // 3. Mock the Task API
    await mockTaskApi(page, taskStore);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});

export { expect } from '@playwright/test';
