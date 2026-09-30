import { type Locator, type Page, expect } from '@playwright/test';

export class CartPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
  }

  async expectLoaded() {
    await expect(this.title).toHaveText('Your Cart');
  }

  async expectItems(names: string[]) {
    await expect(this.items).toHaveCount(names.length);
    for (const name of names) {
      await expect(this.items.filter({ hasText: name })).toBeVisible();
    }
  }

  async checkout() {
    await this.checkoutButton.click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }
}
