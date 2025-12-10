"use client";

import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { api } from '@/lib/api';
import SearchAutocomplete from '@/components/search/SearchAutocomplete';

export default function TopBar({ title }: { title?: string }) {
  const { meQuery, logout } = useAuth();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const today = useMemo(() => new Date(), []);
  const nextWeek = useMemo(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), []);

  const upcoming = useQuery({
    queryKey: ['upcoming-notifs'],
    queryFn: async () =>
      (await api.get('/tasks', { params: { dueAfter: iso(today), dueBefore: iso(nextWeek) } })).data.data as any[],
    staleTime: 60_000,
  });

  return (
    <header className="sticky top-0 z-20 h-14 bg-white/90 dark:bg-[#12121a]/80 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl h-full flex items-center justify-between px-4 gap-3">
        <div className="font-semibold text-sm sm:text-base">{title || 'Workspace'}</div>
        <div className="flex-1 max-w-xl hidden md:block">
          <SearchAutocomplete />
        </div>
        <div className="flex items-center gap-2 relative">
          <button
            className="rounded-full h-9 w-9 grid place-content-center hover:bg-gray-100 dark:hover:bg-[#1b1b26]"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
            title="Notifications"
          >
            🔔
          </button>
          {notifOpen && (
            <div className="absolute right-14 top-10 w-80 rounded-xl border bg-white dark:bg-[#0f0f15] shadow-lg overflow-hidden">
              <div className="p-3 border-b text-sm font-semibold">Upcoming (7 days)</div>
              <div className="max-h-80 overflow-auto p-2 space-y-1">
                {upcoming.isLoading && <div className="text-sm text-gray-500 p-2">Loading...</div>}
                {!upcoming.isLoading && upcoming.data?.length === 0 && (
                  <div className="text-sm text-gray-500 p-2">No upcoming tasks</div>
                )}
                {upcoming.data?.slice(0, 8).map((t: any) => (
                  <a key={t._id} href={`/tasks/${t._id}`} className="block rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#1b1b26]">
                    <div className="text-sm font-medium truncate">{t.title}</div>
                    <div className="text-xs text-gray-500 flex items-center justify-between">
                      <span>{t.project?.title || '—'}</span>
                      <span>{new Date(t.dueDate).toLocaleDateString()}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setAvatarOpen((v) => !v)}
              className="rounded-full h-9 w-9 grid place-content-center bg-indigo-600 text-white"
              aria-label="User menu"
            >
              {meQuery.data?.name?.[0] || 'U'}
            </button>
            {avatarOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg border bg-white dark:bg-[#0f0f15] shadow-md p-1 text-sm">
                <a href="/profile" className="block rounded-md px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#1b1b26]">Profile</a>
                <a href="/settings" className="block rounded-md px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#1b1b26]">Settings</a>
                <button onClick={() => logout.mutate()} className="w-full text-left rounded-md px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#1b1b26]">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-2 shadow-[inset_0_-8px_16px_-16px_rgba(0,0,0,0.5)]" />
    </header>
  );
}

function iso(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}
