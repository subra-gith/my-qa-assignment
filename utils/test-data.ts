/**
 * The demo app publishes these credentials on its own login page, so there is
 * nothing secret here. BASE_URL / SAUCE_USER can still be overridden via .env
 * to point the suite at another environment.
 */
export const users = {
  standard: {
    username: process.env.SAUCE_USER ?? 'standard_user',
    password: process.env.SAUCE_PASSWORD ?? 'secret_sauce',
  },
  lockedOut: { username: 'locked_out_user', password: 'secret_sauce' },
} as const;

export const products = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  boltTshirt: 'Sauce Labs Bolt T-Shirt',
  fleeceJacket: 'Sauce Labs Fleece Jacket',
  onesie: 'Sauce Labs Onesie',
} as const;

export const customer = {
  firstName: 'Naren',
  lastName: 'Tester',
  postalCode: '600001',
};
