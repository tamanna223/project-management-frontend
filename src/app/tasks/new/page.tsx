"use client";

import Navbar from '@/components/Navbar';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

type Form = { title: string; description: string; priority: string; status: string; dueDate: string; project: string };

export default function NewTaskPage() {
  const { register, handleSubmit, reset } = useForm<Form>({
    defaultValues: { priority: 'medium', status: 'todo' },
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data.data as Array<any>,
  });

  const onSubmit = async (d: Form) => {
    try {
      await api.post('/tasks', { ...d, dueDate: new Date(dueDateToISO(d.dueDate)) });
      toast.success('Task created');
      reset();
      window.location.href = '/tasks';
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to create task');
    }
  };

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-2xl p-4">
        <h1 className="text-2xl font-semibold mb-4">New Task</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-4 border rounded-lg text-black">
          <div>
            <label className="text-sm">Title</label>
            <input className="w-full border rounded-md px-3 py-2" {...register('title', { required: true })} />
          </div>
          <div>
            <label className="text-sm">Description</label>
            <textarea className="w-full border rounded-md px-3 py-2" rows={4} {...register('description', { required: true })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Project</label>
              <select className="w-full border rounded-md px-3 py-2" {...register('project', { required: true })}>
                <option value="">Select project</option>
                {projects?.map((p) => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm">Due date</label>
              <input type="date" className="w-full border rounded-md px-3 py-2" {...register('dueDate', { required: true })} />
            </div>
            <div>
              <label className="text-sm">Priority</label>
              <select className="w-full border rounded-md px-3 py-2" {...register('priority', { required: true })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Status</label>
              <select className="w-full border rounded-md px-3 py-2" {...register('status', { required: true })}>
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <button type="submit" className="rounded-md bg-black text-white px-4 py-2">Create</button>
        </form>
      </main>
    </div>
  );
}

function dueDateToISO(dateStr: string) {
  // Keep local date at midnight local time
  const d = new Date(dateStr + 'T00:00:00');
  return d.toISOString();
}
