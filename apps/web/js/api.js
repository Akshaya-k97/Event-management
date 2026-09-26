// Tiny fetch wrapper with access-token memory + auto-refresh on 401.
const API_BASE = 'http://localhost:3000/api';

let accessToken = null;          // in-memory only (short lived)
let currentUser = null;
const listeners = new Set();

export function onAuthChange(fn) {
  listeners.add(fn);
  fn({ user: currentUser });
  return () => listeners.delete(fn);
}

function emit() {
  for (const fn of listeners) fn({ user: currentUser });
}

export function getUser() { return currentUser; }
export function isAuthenticated() { return !!currentUser; }

async function parse(res) {
  const text = await res.text();
  try { return text ? JSON.parse(text) : {}; }
  catch { return { raw: text }; }
}

async function request(method, path, body, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',                // send refresh cookie
    body: body ? JSON.stringify(body) : undefined,
  });

  // Try refresh once if access token expired
  if (res.status === 401 && !opts._retried) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request(method, path, body, { ...opts, _retried: true });
    }
  }

  const data = await parse(res);
  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.details = data.details;
    throw err;
  }
  return data;
}

async function tryRefresh() {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json();
    accessToken = data.accessToken;
    // fetch user too
    const me = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
    });
    if (me.ok) {
      const m = await me.json();
      currentUser = m.user;
      emit();
    }
    return true;
  } catch {
    return false;
  }
}

export const api = {
  // auth
  register: (body) => request('POST', '/auth/register', body),
  login: async (body) => {
    const data = await request('POST', '/auth/login', body);
    accessToken = data.accessToken;
    currentUser = data.user;
    emit();
    return data;
  },
  logout: async () => {
    try { await request('POST', '/auth/logout'); } catch {}
    accessToken = null;
    currentUser = null;
    emit();
  },
  me: async () => {
    const data = await request('GET', '/users/me');
    currentUser = data.user;
    emit();
    return data.user;
  },

  // generic
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  del: (path) => request('DELETE', path),

  // helper exposed for bootstrap
  _silentRefresh: tryRefresh,
};