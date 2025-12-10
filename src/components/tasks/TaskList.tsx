"use client";

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function TaskList() {
  const { data, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.get('/tasks');
      return res.data.data as Array<any>;
    },
  });

  if (isLoading) return <div className="rounded-lg border bg-white/80 dark:bg-[#0f0f15] p-4">Loading tasks...</div>;

  return (
    <div className="rounded-lg border bg-white/80 dark:bg-[#0f0f15] p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium">Tasks</h2>
        <a href="/tasks/new" className="rounded-md bg-indigo-600 text-white px-3 py-1.5 text-sm hover:bg-indigo-700">New</a>
      </div>
      <div className="grid gap-2">
        {data?.length ? data.map((t) => (
          <a key={t._id} href={`/tasks/${t._id}`} className="rounded-md border p-3 bg-white dark:bg-[#141421] hover:shadow-sm transition">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{t.title}</p>
              <span className={`text-xs rounded-full border px-2 py-0.5 ${badgeFor(t.status)}`}>{t.status}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{t.description}</p>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
              <span>Due: {new Date(t.dueDate).toLocaleDateString()}</span>
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 ${prioFor(t.priority)}`}>{t.priority}</span>
            </div>
          </a>
        )) : <p className="text-sm text-gray-600 dark:text-gray-300">No tasks yet.</p>}
      </div>
    </div>
  );
}

function badgeFor(status: string) {
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (status === 'in-progress') return 'bg-indigo-100 text-indigo-700 border-indigo-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
}

function prioFor(p: string) {
  if (p === 'high') return 'bg-rose-100 text-rose-700 border-rose-200';
  if (p === 'medium') return 'bg-amber-100 text-amber-800 border-amber-200';
  return 'bg-sky-100 text-sky-700 border-sky-200';
}
