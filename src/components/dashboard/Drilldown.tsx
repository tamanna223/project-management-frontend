"use client";

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type DrillKey = 'projects'|'tasks'|'completed'|'overdue';

export default function Drilldown({ selected }: { selected?: DrillKey }) {
  const todayISO = useMemo(() => new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).toISOString(), []);

  const projects = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data.data as any[],
    enabled: selected === 'projects',
  });

  const tasksAll = useQuery({
    queryKey: ['tasks-drill', selected],
    queryFn: async () => (await api.get('/tasks')).data.data as any[],
    enabled: selected !== 'projects',
  });

  const rows = useMemo(() => {
    const t = tasksAll.data || [];
    if (selected === 'completed') return t.filter((x: any) => x.status === 'completed');
    if (selected === 'overdue') return t.filter((x: any) => x.status !== 'completed' && new Date(x.dueDate).toISOString() < todayISO);
    return t;
  }, [tasksAll.data, selected, todayISO]);

  if (!selected) return null;

  return (
    <section className="rounded-2xl border bg-white/80 dark:bg-[#0f0f15]/70 backdrop-blur p-4">
      {selected === 'projects' ? (
        <ProjectsTable data={projects.data || []} />
      ) : (
        <TasksTable data={rows} title={titleFor(selected)} />
      )}
    </section>
  );
}

function titleFor(key: DrillKey) {
  if (key === 'tasks') return 'All Tasks';
  if (key === 'completed') return 'Completed Tasks';
  if (key === 'overdue') return 'Overdue Tasks';
  return 'Projects';
}

function ProjectsTable({ data }: { data: any[] }) {
  return (
    <div className="overflow-auto">
      <div className="text-sm font-semibold mb-3">Projects</div>
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-gray-50/60 dark:bg-[#141421]">
          <tr>
            <th className="text-left px-3 py-2">Project</th>
            <th className="text-left px-3 py-2">Description</th>
            <th className="text-left px-3 py-2">Created</th>
            <th className="text-left px-3 py-2">Open</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p._id} className="border-t">
              <td className="px-3 py-2 font-medium truncate max-w-[200px]">{p.title}</td>
              <td className="px-3 py-2 text-gray-600 truncate max-w-[360px]">{p.description}</td>
              <td className="px-3 py-2 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
              <td className="px-3 py-2"><a href={`/projects/${p._id}`} className="rounded-md border px-2 py-1 hover:bg-gray-50">View</a></td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={4} className="px-3 py-6 text-center text-gray-500">No projects found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TasksTable({ data, title }: { data: any[]; title: string }) {
  return (
    <div className="overflow-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">{title}</div>
        <a href="/tasks" className="text-xs text-indigo-600">Open Tasks Page</a>
      </div>
      <table className="w-full text-sm min-w-[720px]">
        <thead className="bg-gray-50/60 dark:bg-[#141421]">
          <tr>
            <th className="text-left px-3 py-2">Title</th>
            <th className="text-left px-3 py-2">Project</th>
            <th className="text-left px-3 py-2">Status</th>
            <th className="text-left px-3 py-2">Priority</th>
            <th className="text-left px-3 py-2">Due Date</th>
            <th className="text-left px-3 py-2">Open</th>
          </tr>
        </thead>
        <tbody>
          {data.map((t) => (
            <tr key={t._id} className="border-t">
              <td className="px-3 py-2 font-medium truncate max-w-[240px]">{t.title}</td>
              <td className="px-3 py-2 text-gray-600 truncate max-w-[200px]">{t.project?.title || '—'}</td>
              <td className="px-3 py-2"><StatusBadge status={t.status} /></td>
              <td className="px-3 py-2 text-gray-600">{t.priority}</td>
              <td className="px-3 py-2 text-gray-600">{new Date(t.dueDate).toLocaleDateString()}</td>
              <td className="px-3 py-2"><a href={`/tasks/${t._id}`} className="rounded-md border px-2 py-1 hover:bg-gray-50">View</a></td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500">No tasks found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'todo': 'bg-gray-100 text-gray-700 border-gray-200',
    'in-progress': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${map[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>{status}</span>;
}
