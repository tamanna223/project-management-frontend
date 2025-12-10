"use client";

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function DashboardSummary() {
  const projects = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data.data as any[],
  });
  const stats = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => (await api.get('/dashboard/stats')).data.data as any,
  });
  const overdue = useQuery({
    queryKey: ['overdue-left'],
    queryFn: async () => (await api.get('/tasks', { params: { dueBefore: new Date().toISOString() } })).data.data as any[],
  });

  const totalProjects = projects.data?.length ?? 0;
  const totalTasks = stats.data?.total ?? 0;
  const completed = stats.data?.completed ?? 0;
  const left = Math.max(0, totalTasks - completed);
  const overdueCount = (overdue.data || []).filter((t: any) => t.status !== 'completed').length;

  const byStatus = [
    { label: 'To do', value: stats.data?.todo ?? 0 },
    { label: 'In Progress', value: stats.data?.inProgress ?? 0 },
    { label: 'Completed', value: completed },
  ];

  return (
    <section className="rounded-2xl border bg-white/80 dark:bg-[#0f0f15]/70 backdrop-blur p-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryItem label="Projects" value={totalProjects} />
        <SummaryItem label="Tasks" value={totalTasks} />
        <SummaryItem label="Completed" value={completed} />
        <SummaryItem label="Left" value={left} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="text-sm font-semibold mb-2">Status Breakdown</div>
          <div className="space-y-2">
            {byStatus.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="w-24 text-xs text-gray-600">{s.label}</span>
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.label === 'Completed' ? 'bg-emerald-500' : s.label === 'In Progress' ? 'bg-indigo-500' : 'bg-gray-400'}`}
                    style={{ width: `${totalTasks ? Math.round((s.value / totalTasks) * 100) : 0}%` }}
                  />
                </div>
                <span className="w-10 text-xs text-right">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm font-semibold mb-2">Overdue</div>
          <div className="text-3xl font-semibold">{overdueCount}</div>
          <p className="text-xs text-gray-500">Tasks due before today (excluding completed)</p>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm font-semibold mb-2">High Priority</div>
          <div className="text-3xl font-semibold">{stats.data?.highPriority ?? 0}</div>
          <p className="text-xs text-gray-500">Number of tasks with high priority</p>
        </div>
      </div>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-4 bg-white/70 dark:bg-[#141421]">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
