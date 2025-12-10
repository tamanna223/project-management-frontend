"use client";

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function ProjectList() {
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data.data as Array<any>;
    },
  });

  if (isLoading) return <div className="rounded-lg border bg-white p-4 text-black">Loading projects...</div>;

  return (
    <div className="rounded-lg border bg-white p-4 text-black">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium">Projects</h2>
        <a href="/projects/new" className="rounded-md bg-black text-white px-3 py-1.5 text-sm">New</a>
      </div>
      <div className="grid gap-2">
        {data?.length ? data.map((p) => (
          <a key={p._id} href={`/projects/${p._id}`} className="rounded-md border p-3 hover:bg-gray-50">
            <p className="font-medium">{p.title}</p>
            <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
          </a>
        )) : <p className="text-sm text-gray-600">No projects yet.</p>}
      </div>
    </div>
  );
}
