import test from 'node:test';
import assert from 'node:assert/strict';

test('Security: Guest Rejection Logic', async (t) => {
  function isGuestRequest(headers) {
    return headers.get('x-guest') === 'true';
  }

  function rejectGuest(headers) {
    if (isGuestRequest(headers)) {
      return { status: 401, error: 'Sign in required' };
    }
    return null;
  }

  await t.test('Rejects request with x-guest: true', () => {
    const headers = new Map([['x-guest', 'true']]);
    const res = rejectGuest(headers);
    assert.ok(res !== null);
    assert.equal(res.status, 401);
  });

  await t.test('Allows normal authenticated requests without x-guest', () => {
    const headers = new Map();
    const res = rejectGuest(headers);
    assert.equal(res, null);
  });
});

test('Security: Cron Secret Validation', async (t) => {
  function validateCronSecret(configuredSecret, providedSecret) {
    return Boolean(configuredSecret && providedSecret && configuredSecret === providedSecret);
  }

  await t.test('Denies access when CRON_SECRET is unconfigured (empty string or undefined)', () => {
    assert.equal(validateCronSecret('', 'some-secret'), false);
    assert.equal(validateCronSecret(undefined, 'some-secret'), false);
  });

  await t.test('Denies access when provided secret is wrong', () => {
    assert.equal(validateCronSecret('super-secret-123', 'wrong-secret'), false);
  });

  await t.test('Allows access only when secret matches exactly', () => {
    assert.equal(validateCronSecret('super-secret-123', 'super-secret-123'), true);
  });
});

