const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const request = async (method, path, body, opts = {}) => {
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  const token = localStorage.getItem('nirovveda_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || err.message || `Request failed (${res.status})`);
  }
  return res.json();
};

export const api = {
  get:  (path, opts) => request('GET', path, null, opts),
  post: (path, body, opts) => request('POST', path, body, opts),
  put:  (path, body, opts) => request('PUT', path, body, opts),
  patch:(path, body, opts) => request('PATCH', path, body, opts),
};

export default api;