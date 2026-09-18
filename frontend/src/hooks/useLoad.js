import { useCallback, useEffect, useRef, useState } from 'react';

// Fetch wrapper with graceful demo-data fallback.
// When the API is unreachable (e.g. DB not running), pages show clearly-flagged demo data.
export function useLoad(fetcher, fallback, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [tick, setTick] = useState(0);
  const started = useRef(false);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const run = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetcher();
      setData(res?.data ?? res ?? null);
      setIsDemo(!!res?.demo);
    } catch (e) {
      console.warn('API unavailable, showing demo data:', e.message);
      setData(fallback);
      setIsDemo(true);
      setError(true);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      run();
    } else {
      run();
    }
  }, [tick, run]);

  return { data, loading, error, isDemo, reload };
}

// Raw fetch helper returning JSON or throwing.
export async function load(path, method = 'GET', body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('nirovveda_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}