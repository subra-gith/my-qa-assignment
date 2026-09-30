import { test, expect } from '../../fixtures/pages';
import { customer, products } from '../../utils/test-data';

test.describe('Checkout', () => {
  // Scenario 4
  test('places an order end to end', async ({ signedIn, cartPage, checkoutPage }) => {
    const basket = [products.backpack, products.fleeceJacket];
    for (const item of basket) {
      await signedIn.addToCart(item);
    }

    await signedIn.openCart();
    await cartPage.expectItems(basket);
    await cartPage.checkout();

    await checkoutPage.fillDetails(customer);
    await checkoutPage.continue();
    await checkoutPage.finish();

    await checkoutPage.expectOrderPlaced();
  });

  test('order total is the subtotal plus tax', async ({ signedIn, cartPage, checkoutPage }) => {
    await signedIn.addToCart(products.backpack);
    await signedIn.openCart();
    await cartPage.checkout();

    await checkoutPage.fillDetails(customer);
    await checkoutPage.continue();

    const { subtotal, tax, total } = await checkoutPage.summary();
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  test('postal code is required before continuing', async ({ signedIn, cartPage, checkoutPage }) => {
    await signedIn.addToCart(products.onesie);
    await signedIn.openCart();
    await cartPage.checkout();

    await checkoutPage.fillDetails({ ...customer, postalCode: '' });
    await checkoutPage.continue();

    await expect(checkoutPage.error).toContainText('Postal Code is required');
  });
});
