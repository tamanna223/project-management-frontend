"use client";

import { useQueries, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function RecentProjectsTable() {
  const projects = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data.data as any[],
  });

  const top = (projects.data || []).slice(0, 5);

  const tasksPerProject = useQueries({
    queries: top.map((p) => ({
      queryKey: ['tasks', { project: p._id }],
      queryFn: async () => (await api.get('/tasks', { params: { project: p._id } })).data.data as any[],
    })),
  });

  if (projects.isLoading) return <div>Loading projects...</div>;

  return (
    <div className="overflow-hidden rounded-xl border bg-white/80 dark:bg-[#0f0f15]/70 backdrop-blur">
      <table className="w-full text-sm">
        <thead className="bg-gray-50/60 dark:bg-[#141421]">
          <tr>
            <th className="text-left px-4 py-2">Project</th>
            <th className="text-left px-4 py-2">Tasks</th>
            <th className="text-left px-4 py-2">Progress</th>
            <th className="text-left px-4 py-2">Updated</th>
            <th className="text-left px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {top.map((p, i) => {
            const tasks = tasksPerProject[i]?.data || [];
            const total = tasks.length;
            const completed = tasks.filter((t: any) => t.status === 'completed').length;
            const progress = total ? (completed / total) * 100 : 0;
            return (
              <tr key={p._id} className="border-t">
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-600 to-indigo-400" />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{p.title}</div>
                      <div className="text-xs text-gray-500 truncate">{p.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2">{completed}/{total}</td>
                <td className="px-4 py-2 w-48"><ProgressBar value={progress} /></td>
                <td className="px-4 py-2">{new Date(p.updatedAt || p.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <a href={`/projects/${p._id}`} className="rounded-md border px-2 py-1 hover:bg-gray-50">View</a>
                    <a href={`/projects/${p._id}`} className="rounded-md border px-2 py-1 hover:bg-gray-50">Edit</a>
                    <a href={`/projects/${p._id}`} className="rounded-md border px-2 py-1 hover:bg-gray-50">⋯</a>
                  </div>
                </td>
              </tr>
            );
          })}
          {top.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-gray-500">No projects yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
