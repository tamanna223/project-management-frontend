"use client";

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function LineMiniCard() {
  // Fetch tasks due in last 7 days (approximate "weekly performance")
  const now = new Date();
  const weekAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  const tasks = useQuery({
    queryKey: ['weekly-performance'],
    queryFn: async () => (await api.get('/tasks', { params: { dueAfter: isoDate(weekAgo), dueBefore: isoDate(now) } })).data.data as any[],
  });

  const series = useMemo(() => {
    const arr = Array(7).fill(0);
    (tasks.data || []).forEach((t: any) => {
      const d = new Date(t.dueDate);
      const idx = Math.max(0, Math.min(6, Math.floor((d.getTime() - weekAgo.getTime()) / (24 * 60 * 60 * 1000))));
      if (t.status === 'completed') arr[idx] += 1;
    });
    return arr;
  }, [tasks.data]);

  const max = Math.max(1, ...series);
  const points = series
    .map((v, i) => {
      const x = (i / 6) * 100;
      const y = 100 - (v / max) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  const total = series.reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-2xl border bg-white/80 dark:bg-[#0f0f15]/70 backdrop-blur p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs text-gray-500">Weekly Productivity</div>
          <div className="text-xl font-semibold">{total} tasks</div>
        </div>
      </div>
      <div className="h-24 relative">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <polyline fill="none" stroke="#635BFF" strokeWidth="2" points={points} />
          {series.map((v, i) => {
            const x = (i / 6) * 100;
            const y = 100 - (v / max) * 100;
            return <circle key={i} cx={x} cy={y} r={1.8} fill="#635BFF" />;
          })}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-gray-500">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function isoDate(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}
