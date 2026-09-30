import { type Locator, type Page, expect } from '@playwright/test';
import { parsePrice } from './ProductsPage';

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutPage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly error: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly confirmation: Locator;

  constructor(private readonly page: Page) {
    this.firstName = page.getByPlaceholder('First Name');
    this.lastName = page.getByPlaceholder('Last Name');
    this.postalCode = page.getByPlaceholder('Zip/Postal Code');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    this.error = page.getByTestId('error');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.confirmation = page.getByRole('heading', { name: /thank you for your order/i });
  }

  async fillDetails({ firstName, lastName, postalCode }: CustomerDetails) {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    await this.postalCode.fill(postalCode);
  }

  async continue() {
    await this.continueButton.click();
  }

  async finish() {
    await this.finishButton.click();
  }

  /**
   * Reads the three money figures off the overview step. Asserting on these
   * relative to each other keeps the test alive if Sauce Labs ever reprices
   * the catalogue.
   */
  async summary(): Promise<{ subtotal: number; tax: number; total: number }> {
    const [subtotal, tax, total] = await Promise.all([
      this.subtotalLabel.innerText(),
      this.taxLabel.innerText(),
      this.totalLabel.innerText(),
    ]);
    return {
      subtotal: parsePrice(subtotal),
      tax: parsePrice(tax),
      total: parsePrice(total),
    };
  }

  async expectOrderPlaced() {
    await expect(this.confirmation).toBeVisible();
  }
}
