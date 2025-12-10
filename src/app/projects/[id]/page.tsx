"use client";

import AppShell from '@/components/layout/AppShell';
import TaskFilters, { TaskFiltersState } from '@/components/tasks/TaskFilters';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const project = useQuery({
    queryKey: ['project', id],
    queryFn: async () => (await api.get(`/projects/${id}`)).data.data as any,
  });

  const [filters, setFilters] = useState<TaskFiltersState>({});

  const tasks = useQuery({
    queryKey: ['tasks', { project: id, ...filters }],
    queryFn: async () => {
      const res = await api.get('/tasks', { params: { project: id, ...filters } });
      return res.data.data as any[];
    },
  });

  const { register, handleSubmit, reset } = useForm<{ title: string; description: string }>({
    values: project.data ? { title: project.data.title, description: project.data.description } : undefined,
  });

  const onUpdate = useMutation({
    mutationFn: async (d: { title: string; description: string }) => (await api.put(`/projects/${id}`, d)).data,
    onSuccess: async () => {
      toast.success('Project updated');
      await qc.invalidateQueries({ queryKey: ['project', id] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Update failed'),
  });

  const onDelete = useMutation({
    mutationFn: async () => (await api.delete(`/projects/${id}`)).data,
    onSuccess: async () => {
      toast.success('Project deleted');
      router.push('/projects');
    },
  });

  return (
    <AppShell title={project.data?.title || 'Project'}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row">
          <section className="flex-1 space-y-4">
            <h1 className="text-2xl font-semibold">Project</h1>
            <form
              onSubmit={handleSubmit((d) => onUpdate.mutate(d))}
              className="space-y-3 rounded-lg border bg-white/90 dark:bg-[#141421] p-4"
            >
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-200">Title</label>
                <input
                  className="w-full rounded-md border px-3 py-2 bg-white dark:bg-[#1b1b26] text-black dark:text-white placeholder:text-gray-400"
                  {...register('title', { required: true })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-200">Description</label>
                <textarea
                  className="w-full rounded-md border px-3 py-2 bg-white dark:bg-[#1b1b26] text-black dark:text-white placeholder:text-gray-400"
                  rows={4}
                  {...register('description', { required: true })}
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="rounded-md bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 disabled:opacity-50" disabled={onUpdate.isPending}>
                  {onUpdate.isPending ? 'Saving...' : 'Save changes'}
                </button>
                <button type="button" onClick={() => reset()} className="rounded-md border px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#1b1b26]">Reset</button>
                <button type="button" onClick={() => { if (confirm('Delete project?')) onDelete.mutate(); }} className="ml-auto rounded-md border border-rose-300 text-rose-600 px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                  Delete
                </button>
              </div>
            </form>
          </section>
          <aside className="lg:w-80 space-y-3">
            <div className="rounded-lg border bg-white/80 dark:bg-[#0f0f15] p-4">
              <h2 className="font-medium mb-2">New Task</h2>
              <a href="/tasks/new" className="inline-block rounded-md bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700">Add Task</a>
            </div>
          </aside>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Kanban</h2>
          </div>
          <KanbanBoard projectId={id} />
        </section>
      </div>
    </AppShell>
  );
}
