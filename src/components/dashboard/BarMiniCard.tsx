"use client";

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function BarMiniCard() {
  const stats = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => (await api.get('/dashboard/stats')).data.data as any,
  });

  const data = useMemo(() => {
    const s = stats.data || { todo: 0, inProgress: 0, completed: 0 };
    return [
      { label: 'Todo', value: s.todo || 0, color: '#9CA3AF' },
      { label: 'In Prog', value: s.inProgress || 0, color: '#635BFF' },
      { label: 'Review', value: 0, color: '#0EA5E9' },
      { label: 'Done', value: s.completed || 0, color: '#10B981' },
    ];
  }, [stats.data]);

  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="rounded-2xl border bg-white/80 dark:bg-[#0f0f15]/70 backdrop-blur p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-500">Task Status Breakdown</div>
      </div>
      <div className="h-24 grid place-items-end gap-1" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {data.map((d) => (
          <div key={d.label} className="flex flex-col items-center gap-1">
            <div
              className="w-7 rounded-t-md"
              style={{ height: `${(d.value / max) * 96 || 0}px`, background: d.color }}
              title={`${d.label}: ${d.value}`}
            />
            <span className="text-[10px] text-gray-500">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
