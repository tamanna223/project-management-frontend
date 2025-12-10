"use client";

import AppShell from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProjectsIndexPage() {
  const qc = useQueryClient();
  const projects = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data.data as any[],
  });

  const del = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/projects/${id}`)).data,
    onSuccess: async () => {
      toast.success('Project deleted');
      await qc.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Delete failed'),
  });

  return (
    <AppShell title="Projects">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <a href="/projects/new" className="rounded-md bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700">New Project</a>
      </div>

      {projects.isLoading ? (
        <Card><CardContent>Loading projects...</CardContent></Card>
      ) : (
        <div className="relative">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.data?.map((p) => (
              <ProjectCard key={p._id} p={p} onDelete={() => { if (confirm('Delete project?')) del.mutate(p._id); }} />
            ))}
          </div>
          <a
            href="/projects/new"
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 grid place-content-center h-14 w-14 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 text-white shadow-xl hover:shadow-2xl transition-shadow"
            title="Create Project"
            aria-label="Create Project"
          >
            <span className="text-2xl">＋</span>
          </a>
        </div>
      )}
    </AppShell>
  );
}

function ProjectCard({ p, onDelete }: { p: any; onDelete: () => void }) {
  const { data: tasks } = useQuery({
    queryKey: ['tasks', { project: p._id }],
    queryFn: async () => (await api.get('/tasks', { params: { project: p._id } })).data.data as any[],
  });

  const total = tasks?.length || 0;
  const completed = (tasks || []).filter((t) => t.status === 'completed').length || 0;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  const members = Array.from(
    new Map(
      (tasks || [])
        .filter((t: any) => t.user)
        .map((t: any) => {
          const u = t.user as any;
          return [String(u._id || u.email || u.name), { name: u.name, email: u.email }];
        })
    ).values()
  ).slice(0, 5);
  const status: { label: string; color: any } = progress >= 80
    ? { label: 'On Track', color: 'green' }
    : progress >= 40
    ? { label: 'In Progress', color: 'indigo' }
    : { label: 'Planning', color: 'gray' } as any;

  return (
    <Card className="group rounded-2xl border bg-white/95 dark:bg-[#181826] shadow-sm transition-transform hover:scale-[1.01] hover:shadow-md">
      <CardHeader>
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-400" />
          <CardTitle className="truncate text-gray-900 dark:text-gray-100" title={p.title}>{p.title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={status.color}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-white/90 line-clamp-2 mb-4">{p.description}</p>
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span className="tabular-nums">{completed}/{total} ({progress}%)</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-[#222232] overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {members.map((m, idx) => (
              <span key={idx} className="inline-grid place-content-center h-7 w-7 rounded-full border bg-indigo-50 text-[10px] text-indigo-700" title={m.name || m.email}>
                {initials(m.name, m.email)}
              </span>
            ))}
            {members.length === 0 && (
              <span className="text-xs text-gray-500">No members yet</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a href={`/projects/${p._id}`} className="inline-flex items-center rounded-md bg-white text-indigo-600 px-3 py-1.5 text-sm border border-indigo-200 hover:bg-indigo-50 dark:bg-transparent dark:border-indigo-400/30 dark:text-indigo-300">Open</a>
            <a href={`/projects/${p._id}`} className="inline-flex items-center rounded-md bg-white text-gray-700 px-3 py-1.5 text-sm border hover:bg-gray-50 dark:bg-transparent dark:text-gray-300 dark:border-gray-600">Edit</a>
            <button onClick={onDelete} className="inline-flex items-center rounded-md border border-rose-300 text-rose-600 px-3 py-1.5 text-sm hover:bg-rose-50 dark:hover:bg-rose-900/20">Delete</button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function initials(name?: string, email?: string) {
  if (name && name.trim().length) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts[parts.length - 1]?.[0] || '';
    return (first + last).toUpperCase();
  }
  if (email && email.length) return email[0]?.toUpperCase();
  return 'U';
}
