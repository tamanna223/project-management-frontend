"use client";

import { useEffect, useId, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

function Ring({ value, colors = ['#635BFF', '#9aa0ff'], centerText }: { value: number; colors?: [string, string] | string[]; centerText?: string | number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const r = 18;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const gid = useId().replace(/:/g, '_');
  return (
    <div className="relative h-12 w-12">
      <svg viewBox="0 0 48 48" className="h-12 w-12">
        <defs>
          <linearGradient id={`grad_${gid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r={r} stroke="#e5e7eb" strokeWidth="6" fill="none" />
        <circle
          cx="24"
          cy="24"
          r={r}
          stroke={`url(#grad_${gid})`}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 24 24)"
        />
      </svg>
      {centerText !== undefined && (
        <div className="absolute inset-0 grid place-content-center text-[10px] font-semibold text-gray-700 dark:text-gray-200">
          {centerText}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsCards({ onSelect }: { onSelect?: (key: 'projects'|'tasks'|'completed'|'overdue') => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 30);
    return () => clearTimeout(t);
  }, []);
  const projects = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data.data as any[],
  });
  const stats = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => (await api.get('/dashboard/stats')).data.data as any,
  });
  const overdue = useQuery({
    queryKey: ['overdue'],
    queryFn: async () =>
      (await api.get('/tasks', { params: { dueBefore: new Date().toISOString(), status: 'todo' } })).data.data as any[],
  });

  const cards = [
    {
      key: 'projects',
      title: 'Total Projects',
      value: projects.data?.length ?? 0,
      ring: 100,
      icon: '📁',
      colors: ['#635BFF', '#8b85ff'],
    },
    {
      key: 'tasks',
      title: 'Total Tasks',
      value: stats.data?.total ?? 0,
      ring: 100,
      icon: '📝',
      colors: ['#10b981', '#84cc16'],
    },
    {
      key: 'completed',
      title: 'Completed Tasks',
      value: stats.data?.completed ?? 0,
      ring: stats.data?.total ? (stats.data.completed / stats.data.total) * 100 : 0,
      icon: '✅',
      colors: ['#7c3aed', '#d946ef'],
    },
    {
      key: 'overdue',
      title: 'Overdue Tasks',
      value: overdue.data?.length ?? 0,
      ring: overdue.data?.length ? 100 : 10,
      icon: '⏰',
      colors: ['#ef4444', '#f97316'],
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => (
        <button
          key={c.title}
          style={{ transitionDelay: `${i * 60}ms` }}
          className={`rounded-2xl border bg-white/80 dark:bg-[#0f0f15]/70 backdrop-blur p-4 shadow-sm transform-gpu transition-all duration-500
            ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
            hover:shadow-lg hover:shadow-indigo-100/50 hover:scale-[1.03] hover:-translate-y-[1px] text-left`}
          onClick={() => onSelect?.(c.key as any)}
        >
          <div className="flex items-center gap-4">
            <div className="grid place-content-center rounded-full h-12 w-12 bg-gradient-to-br from-indigo-600 to-indigo-400 text-white text-lg shadow-sm">
              {c.icon}
            </div>
            <div>
              <div className="text-sm text-gray-500">{c.title}</div>
              <div className="text-2xl font-semibold">{c.value}</div>
            </div>
            <div className="ml-auto">
              <Ring value={c.ring} colors={c.colors as any} centerText={c.value} />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
