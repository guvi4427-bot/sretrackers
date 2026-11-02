import test from 'node:test';
import assert from 'node:assert/strict';

function resolveApiUrl(path, baseUrl) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!baseUrl) {
    return cleanPath;
  }
  return `${baseUrl.replace(/\/$/, '')}${cleanPath}`;
}

test('Centralized API Configuration tests', async (t) => {
  await t.test('Returns relative path when baseUrl is empty (same-origin / reverse-proxy mode)', () => {
    assert.equal(resolveApiUrl('/api/health', ''), '/api/health');
    assert.equal(resolveApiUrl('api/user/profile', ''), '/api/user/profile');
  });

  await t.test('Prefixes custom backend origin when configured', () => {
    const customOrigin = 'https://api.sretrack.com';
    assert.equal(resolveApiUrl('/api/health', customOrigin), 'https://api.sretrack.com/api/health');
    assert.equal(resolveApiUrl('/api/posts', 'https://api.sretrack.com/'), 'https://api.sretrack.com/api/posts');
  });
});

