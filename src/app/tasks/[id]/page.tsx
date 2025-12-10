"use client";

import AppShell from '@/components/layout/AppShell';
import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useQuery as useRQ } from '@tanstack/react-query';

 type TaskForm = {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string; // yyyy-MM-dd
};

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const task = useQuery({
    queryKey: ['task', id],
    queryFn: async () => (await api.get(`/tasks/${id}`)).data.data as any,
  });

  const { register, handleSubmit, reset } = useForm<TaskForm>({
    values: task.data ? mapTaskToForm(task.data) : undefined,
    mode: 'onChange',
  });

  const onUpdate = useMutation({
    mutationFn: async (d: TaskForm) => {
      const updateData = { ...d };
      // Only format the date if it's not already a Date object
      if (updateData.dueDate) {
        updateData.dueDate = d.dueDate instanceof Date 
          ? d.dueDate.toISOString() 
          : new Date(d.dueDate).toISOString();
      }
      return (await api.put(`/tasks/${id}`, updateData)).data;
    },
    onSuccess: async () => {
      toast.success('Task updated');
      await qc.invalidateQueries({ queryKey: ['task', id] });
      await qc.invalidateQueries({ queryKey: ['tasks'] });
      await qc.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Update failed'),
  });

  const onDelete = useMutation({
    mutationFn: async () => (await api.delete(`/tasks/${id}`)).data,
    onSuccess: async () => {
      toast.success('Task deleted');
      await qc.invalidateQueries({ queryKey: ['tasks'] });
      await qc.invalidateQueries({ queryKey: ['dashboardStats'] });
      router.push('/tasks');
    },
  });

  if (task.isLoading) {
    return (
      <AppShell title="Task">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border bg-white/80 dark:bg-[#0f0f15] p-4">Loading task...</div>
        </div>
      </AppShell>
    );
  }

  if (!task.data) {
    return (
      <AppShell title="Task">
        <div className="mx-auto max-w-2xl p-4">
          <div className="rounded-lg border bg-white/80 dark:bg-[#0f0f15] p-4">Task not found</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Task">
      <div className="mx-auto max-w-2xl p-4">
        <h1 className="text-2xl font-semibold mb-4">Task</h1>
        <form onSubmit={handleSubmit((d) => onUpdate.mutate(d))} className="space-y-4 bg-white/90 dark:bg-[#141421] p-4 border rounded-lg">
          <div>
            <label className="text-sm text-gray-700 dark:text-gray-200">Title</label>
            <input className="w-full border rounded-md px-3 py-2 bg-white dark:bg-[#1b1b26] text-black dark:text-white placeholder:text-gray-400" {...register('title', { required: true })} />
          </div>
          <div>
            <label className="text-sm text-gray-700 dark:text-gray-200">Description</label>
            <textarea className="w-full border rounded-md px-3 py-2 bg-white dark:bg-[#1b1b26] text-black dark:text-white placeholder:text-gray-400" rows={4} {...register('description', { required: true })} />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-200">Status</label>
              <select className="w-full border rounded-md px-3 py-2 bg-white dark:bg-[#1b1b26] text-black dark:text-white" {...register('status', { required: true })}>
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-200">Priority</label>
              <select className="w-full border rounded-md px-3 py-2 bg-white dark:bg-[#1b1b26] text-black dark:text-white" {...register('priority', { required: true })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-200">Due Date</label>
              <input 
                type="date" 
                className="w-full border rounded-md px-3 py-2 bg-white dark:bg-[#1b1b26] text-black dark:text-white" 
                {...register('dueDate', { 
                  required: 'Due date is required',
                  valueAsDate: true
                })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="rounded-md bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 disabled:opacity-50" disabled={onUpdate.isPending}>
              {onUpdate.isPending ? 'Saving...' : 'Save changes'}
            </button>
            <button type="button" onClick={() => reset(mapTaskToForm(task.data))} className="rounded-md border px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#1b1b26]">Reset</button>
            <button type="button" onClick={() => { if (confirm('Delete task?')) onDelete.mutate(); }} className="ml-auto rounded-md border border-rose-300 text-rose-600 px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-900/20">
              Delete
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

function mapTaskToForm(t: any): TaskForm {
  return {
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: isoToDateInput(t.dueDate),
  } as TaskForm;
}

function isoToDateInput(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
