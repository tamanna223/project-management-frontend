"use client";

import Navbar from '@/components/Navbar';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

type Form = { title: string; description: string };

export default function NewProjectPage() {
  const { register, handleSubmit, reset } = useForm<Form>();

  const onSubmit = async (d: Form) => {
    try {
      await api.post('/projects', d);
      toast.success('Project created');
      reset();
      window.location.href = '/projects';
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-2xl p-4">
        <h1 className="text-2xl font-semibold mb-4">New Project</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-4 border rounded-lg text-black">
          <div>
            <label className="text-sm">Title</label>
            <input className="w-full border rounded-md px-3 py-2" {...register('title', { required: true })} />
          </div>
          <div>
            <label className="text-sm">Description</label>
            <textarea className="w-full border rounded-md px-3 py-2" rows={5} {...register('description', { required: true })} />
          </div>
          <button type="submit" className="rounded-md bg-black text-white px-4 py-2">Create</button>
        </form>
      </main>
    </div>
  );
}
