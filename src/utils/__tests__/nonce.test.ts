import '../../__tests__/shopify-global';

test('nonce always returns a new 15 digit random number as a string', () => {
  const firstNonce = global.shopify.utils.nonce();
  const secondNonce = global.shopify.utils.nonce();

  expect(firstNonce.length).toBe(15);
  expect(secondNonce.length).toBe(15);
  expect(typeof firstNonce).toBe('string');
  expect(typeof secondNonce).toBe('string');
});

test('nonce always returns a unique value', () => {
  for (let i = 0; i < 100; i++) {
    const first = global.shopify.utils.nonce();
    const second = global.shopify.utils.nonce();

    expect(first).not.toEqual(second);
  }
});
