"use client";

import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { meQuery, logout } = useAuth();
  return (
    <header className="sticky top-0 z-10 w-full border-b bg-white/80 backdrop-blur text-black">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        <a href="/dashboard" className="font-semibold">Project Manager</a>
        <nav className="flex items-center gap-3">
          <a href="/dashboard" className="text-sm">Dashboard</a>
          {meQuery.data ? (
            <button
              onClick={() => logout.mutate()}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
            >Logout</button>
          ) : (
            <a className="rounded-md border px-3 py-1.5 text-sm" href="/login">Login</a>
          )}
        </nav>
      </div>
    </header>
  );
}
