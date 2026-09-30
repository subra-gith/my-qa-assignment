import { test, expect } from '../../fixtures/pages';
import { products } from '../../utils/test-data';

test.describe('Product catalogue', () => {
  test('lists every product on sale', async ({ signedIn }) => {
    await expect(signedIn.items).toHaveCount(6);
    expect(await signedIn.names()).toContain(products.backpack);
  });

  // Scenario 5
  test('sorting by price low to high puts the cheapest product first', async ({ signedIn }) => {
    await signedIn.sortBy('lohi');

    const prices = await signedIn.prices();
    expect(prices[0]).toBe(Math.min(...prices));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sorting by name Z to A reverses the catalogue', async ({ signedIn }) => {
    await signedIn.sortBy('za');

    const names = await signedIn.names();
    expect(names).toEqual([...names].sort().reverse());
  });
});

test.describe('Cart', () => {
  // Scenario 3
  test('badge shows 2 after adding two products', async ({ signedIn }) => {
    await signedIn.addToCart(products.backpack);
    await signedIn.addToCart(products.bikeLight);

    await expect(signedIn.cartBadge).toHaveText('2');
  });

  test('badge decrements when a product is removed', async ({ signedIn }) => {
    await signedIn.addToCart(products.backpack);
    await signedIn.addToCart(products.bikeLight);

    await signedIn.removeFromCart(products.backpack);

    await expect(signedIn.cartBadge).toHaveText('1');
  });

  test('holds exactly the products that were added', async ({ signedIn, cartPage }) => {
    const chosen = [products.boltTshirt, products.onesie];
    for (const item of chosen) {
      await signedIn.addToCart(item);
    }

    await signedIn.openCart();

    await cartPage.expectLoaded();
    await cartPage.expectItems(chosen);
  });

  test('keeps its contents when returning to the catalogue', async ({ signedIn, cartPage }) => {
    await signedIn.addToCart(products.fleeceJacket);
    await signedIn.openCart();

    await cartPage.continueShopping();

    await signedIn.expectLoaded();
    await expect(signedIn.cartBadge).toHaveText('1');
  });
});
