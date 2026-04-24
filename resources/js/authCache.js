// Shared in-memory cache for /api/auth/status — prevents every component from making its own call
let _cache = null;
let _promise = null;

export async function getAuthStatus() {
  if (_cache) return _cache;
  if (_promise) return _promise;
  _promise = fetch('/api/auth/status', { credentials: 'include' })
    .then(r => r.json())
    .then(data => { _cache = data; _promise = null; return data; })
    .catch(() => { _promise = null; return { isAuthenticated: false, user: null }; });
  return _promise;
}

export function clearAuthCache() {
  _cache = null;
  _promise = null;
}
