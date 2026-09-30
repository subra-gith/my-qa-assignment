import { type Locator, type Page, expect } from '@playwright/test';

/** Values behind the sort dropdown's visible options. */
export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class ProductsPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly sortDropdown: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.sortDropdown = page.getByRole('combobox');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  async expectLoaded() {
    await expect(this.title).toHaveText('Products');
    await expect(this.items.first()).toBeVisible();
  }

  private card(productName: string): Locator {
    return this.items.filter({ hasText: productName });
  }

  async addToCart(productName: string) {
    await this.card(productName).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(productName: string) {
    await this.card(productName).getByRole('button', { name: 'Remove' }).click();
  }

  async sortBy(option: SortOption) {
    await this.sortDropdown.selectOption(option);
  }

  async names(): Promise<string[]> {
    return this.items.getByTestId('inventory-item-name').allInnerTexts();
  }

  async prices(): Promise<number[]> {
    const raw = await this.items.getByTestId('inventory-item-price').allInnerTexts();
    return raw.map(parsePrice);
  }

  async openCart() {
    await this.cartLink.click();
  }
}

export function parsePrice(text: string): number {
  const match = text.match(/([\d.]+)/);
  if (!match) throw new Error(`Could not parse a price from "${text}"`);
  return Number(match[1]);
}
