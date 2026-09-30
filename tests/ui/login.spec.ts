import { test, expect } from '../../fixtures/pages';
import { users } from '../../utils/test-data';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  // Scenario 1
  test('standard user lands on the products page', async ({ loginPage, productsPage }) => {
    await loginPage.login(users.standard.username, users.standard.password);

    await productsPage.expectLoaded();
  });

  // Scenario 2
  test('locked out user sees the error and is not logged in', async ({ page, loginPage }) => {
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);

    await loginPage.expectError('Sorry, this user has been locked out');

    // The error alone does not prove the session was refused — assert we are
    // still sitting on the login form and never reached the catalogue.
    await expect(page).not.toHaveURL(/inventory/);
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('wrong password is refused', async ({ loginPage }) => {
    await loginPage.login(users.standard.username, 'definitely-not-it');

    await loginPage.expectError('Username and password do not match');
  });

  // The app validates one field at a time, so these are separate cases rather
  // than a single "empty form" test.
  const missingField = [
    { field: 'username', username: '', password: 'secret_sauce', message: 'Username is required' },
    { field: 'password', username: 'standard_user', password: '', message: 'Password is required' },
  ];

  for (const { field, username, password, message } of missingField) {
    test(`missing ${field} is reported`, async ({ loginPage }) => {
      await loginPage.login(username, password);

      await loginPage.expectError(message);
    });
  }

  test('products page cannot be reached without signing in', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    await loginPage.expectError(/you can only access/i);
  });
});
