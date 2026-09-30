import { test, expect } from '@playwright/test';

/**
 * API layer only — these use Playwright's `request` fixture, so no browser is
 * launched. baseURL and headers come from the `api` project in
 * playwright.config.ts.
 *
 * Heads-up: reqres.in allows 40 requests/day per IP for anonymous callers and
 * returns 429 after that. This file deliberately stays at four requests per
 * run so a full `npm test` costs very little of that budget.
 */

const newUser = { name: 'morpheus', job: 'leader' };

test.describe('GET /api/users', () => {
  // Scenario 6
  test('returns page 2 of the user list', async ({ request }) => {
    const response = await request.get('/api/users', { params: { page: 2 } });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.page).toBe(2);
  });

  // Scenario 6 — the field contract, kept separate from the status check.
  test('every user carries id, email, first_name and last_name', async ({ request }) => {
    const response = await request.get('/api/users', { params: { page: 2 } });
    expect(response.ok()).toBeTruthy();

    const { data } = await response.json();

    for (const user of data) {
      expect(user).toMatchObject({
        id: expect.any(Number),
        email: expect.any(String),
        first_name: expect.any(String),
        last_name: expect.any(String),
      });
      expect(user.email).toContain('@');
    }
  });
});

test.describe('POST /api/users', () => {
  // Scenario 7
  test('creates a user and echoes back the payload', async ({ request }) => {
    const response = await request.post('/api/users', { data: newUser });

    expect(
      response.status(),
      'a 429 here means the 40 requests/day anonymous reqres quota for this IP is spent — it resets at midnight UTC'
    ).toBe(201);

    const body = await response.json();
    expect(body).toMatchObject(newUser);

    // reqres hands the new id back as a string rather than a number.
    expect(String(body.id)).toMatch(/^\d+$/);
    expect(Number.isNaN(Date.parse(body.createdAt))).toBe(false);
  });

  /**
   * Scenario 8 (bonus) — how a create-then-verify chain would be structured.
   *
   * The brief notes reqres does not persist, so this stops at the contract that
   * matters for chaining: the create response must hand back an id usable as
   * the next request's path segment. It deliberately makes no follow-up call.
   *
   * An earlier version did issue the GET and assert the resulting 404. That was
   * a mistake twice over: it tested reqres's limitation rather than our flow,
   * and because reqres returns a random id it would pass or fail depending on
   * whether that id collided with one of the 12 seeded users.
   */
  test('create response yields an id a follow-up request could use', async ({ request }) => {
    const created = await request.post('/api/users', { data: newUser });
    expect(
      created.status(),
      'a 429 here means the 40 requests/day anonymous reqres quota for this IP is spent — it resets at midnight UTC'
    ).toBe(201);

    const { id } = await created.json();

    expect(String(id)).toMatch(/^\d+$/);

    // Against a persisting API the chain would continue:
    //   const lookup = await request.get(`/api/users/${id}`);
    //   expect(lookup.status()).toBe(200);
    //   expect((await lookup.json()).data).toMatchObject({ id: Number(id), ...newUser });
  });
});
