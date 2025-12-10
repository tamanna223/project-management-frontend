"use client";

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function DonutMiniCard() {
  const tasks = useQuery({
    queryKey: ['priority-distribution'],
    queryFn: async () => (await api.get('/tasks')).data.data as any[],
  });

  const counts = useMemo(() => {
    const arr = { high: 0, medium: 0, low: 0 } as Record<string, number>;
    (tasks.data || []).forEach((t: any) => {
      if (t.priority === 'high') arr.high += 1;
      else if (t.priority === 'medium') arr.medium += 1;
      else if (t.priority === 'low') arr.low += 1;
    });
    return arr;
  }, [tasks.data]);

  const total = Math.max(1, counts.high + counts.medium + counts.low);
  const segs = [
    { label: 'High', value: counts.high, color: '#ef4444' },
    { label: 'Medium', value: counts.medium, color: '#f59e0b' },
    { label: 'Low', value: counts.low, color: '#10b981' },
  ];

  const r = 20;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="rounded-2xl border bg-white/80 dark:bg-[#0f0f15]/70 backdrop-blur p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-500">Priority Distribution</div>
      </div>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 60 60" className="h-24 w-24">
          <circle cx="30" cy="30" r={r} stroke="#e5e7eb" strokeWidth="8" fill="none" />
          {segs.map((s, idx) => {
            const len = (s.value / total) * c;
            const dashArray = `${len} ${c - len}`;
            const el = (
              <circle
                key={idx}
                cx="30"
                cy="30"
                r={r}
                stroke={s.color}
                strokeWidth="8"
                fill="none"
                strokeDasharray={dashArray}
                strokeDashoffset={-offset}
                transform="rotate(-90 30 30)"
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="text-xs grid gap-1">
          {segs.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              <span className="text-gray-600 w-14">{s.label}</span>
              <span className="font-medium">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
