"use client";

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function UpcomingPanel() {
  const today = useMemo(() => new Date(), []);
  const nextWeek = useMemo(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), []);

  const upcoming = useQuery({
    queryKey: ['upcoming-dashboard'],
    queryFn: async () => (await api.get('/tasks', { params: { dueAfter: toISODate(today), dueBefore: toISODate(nextWeek) } })).data.data as any[],
  });

  return (
    <div className="space-y-3">
      <MiniCalendar baseDate={today} />
      <div className="rounded-xl border bg-white/80 dark:bg-[#0f0f15]/70 backdrop-blur p-3">
        <div className="text-sm font-semibold mb-2">Upcoming Deadlines</div>
        <div className="grid gap-2 max-h-80 overflow-auto">
          {upcoming.isLoading && <div className="text-sm text-gray-500">Loading...</div>}
          {!upcoming.isLoading && upcoming.data?.length === 0 && (
            <div className="text-sm text-gray-500">No upcoming tasks</div>
          )}
          {upcoming.data?.map((t) => (
            <a key={t._id} href={`/tasks/${t._id}`} className="rounded-lg border px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#1b1b26]">
              <div className="text-sm font-medium truncate">{t.title}</div>
              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>{t.project?.title || '—'}</span>
                <span className="inline-flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${statusDot(t.status)}`} />
                  {new Date(t.dueDate).toLocaleDateString()}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function toISODate(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}

function statusDot(status: string) {
  if (status === 'completed') return 'bg-emerald-500';
  if (status === 'in-progress') return 'bg-indigo-500';
  return 'bg-gray-400';
}

function MiniCalendar({ baseDate }: { baseDate: Date }) {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const startDay = d.getDay();
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: startDay + daysInMonth }, (_, i) => (i < startDay ? '' : String(i - startDay + 1)));

  const monthLabel = d.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="rounded-xl border bg-white/80 dark:bg-[#0f0f15]/70 backdrop-blur p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">{monthLabel}</div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs">
        {['S','M','T','W','T','F','S'].map((w) => (
          <div key={w} className="text-gray-500 text-center py-1">{w}</div>
        ))}
        {days.map((v, i) => (
          <div key={i} className={`h-7 grid place-content-center rounded ${v ? 'bg-white/70 dark:bg-[#1b1b26]' : ''}`}>{v}</div>
        ))}
      </div>
    </div>
  );
}
