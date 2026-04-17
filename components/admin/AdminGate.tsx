// =============================================================================
// components/admin/AdminGate.tsx
// Client-side password gate for the admin dashboard.
// Stores the bearer token in sessionStorage so it is cleared when the
// browser tab is closed (not localStorage — no persistent security risk).
// =============================================================================

'use client';

import { useState, useEffect, type ReactNode } from 'react';

interface AdminGateProps {
  children: ReactNode;
}

const SESSION_KEY = 'bm_admin_token';

export default function AdminGate({ children }: AdminGateProps) {
  const [token,     setToken]     = useState('');
  const [input,     setInput]     = useState('');
  const [error,     setError]     = useState('');
  const [checking,  setChecking]  = useState(true); // true while we read sessionStorage

  // On mount: restore token from sessionStorage (survives page refresh, not tab close)
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) setToken(saved);
    setChecking(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Quick server ping to validate the token before storing it
    const res = await fetch('/api/products', {
      headers: { Authorization: `Bearer ${input}` },
    });

    // We validate by attempting an admin-only request.
    // A 200 or 201 from GET means anon access — that doesn't prove admin.
    // Instead we do a lightweight POST to /api/admin/ping if you add one,
    // OR simply trust the token and let API calls fail gracefully.
    // For simplicity here: store if non-empty, API routes will reject if wrong.
    if (input.trim().length < 6) {
      setError('Token must be at least 6 characters.');
      return;
    }

    sessionStorage.setItem(SESSION_KEY, input.trim());
    setToken(input.trim());
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setToken('');
    setInput('');
  };

  // While checking sessionStorage — show nothing to avoid flash
  if (checking) return null;

  // Not logged in — show password gate
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-600 text-white text-2xl font-bold shadow">
              B
            </span>
          </div>
          <h1 className="text-center text-xl font-bold text-gray-900">Admin Access</h1>
          <p className="mt-1 text-center text-sm text-gray-500">Enter your admin token to continue</p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Admin Token
              </label>
              <input
                id="token"
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm
                           focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-amber-600 py-3 text-sm font-bold text-white
                         transition hover:bg-amber-700 active:scale-95"
            >
              Login →
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-gray-400">
            Set ADMIN_SECRET in your .env.local file.
          </p>
        </div>
      </div>
    );
  }

  // Logged in — render dashboard with logout button in a wrapper
  return (
    <div>
      {/* Admin top bar */}
      <div className="sticky top-16 z-30 flex items-center justify-between border-b border-amber-200 bg-amber-50 px-4 py-2.5">
        <p className="text-xs font-semibold text-amber-800">🔐 Admin Mode</p>
        <button
          onClick={handleLogout}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
        >
          Logout
        </button>
      </div>
      {/* Pass token down via a custom event / context if children need it */}
      {children}
    </div>
  );
}
