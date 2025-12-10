"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function SearchAutocomplete() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as any)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const tasksQuery = useQuery({
    queryKey: ['search-tasks', q],
    queryFn: async () => (await api.get('/tasks', { params: { search: q } })).data.data as any[],
    enabled: q.trim().length >= 2,
  });

  const projectsQuery = useQuery({
    queryKey: ['search-projects', q],
    queryFn: async () => (await api.get('/projects')).data.data as any[],
    enabled: q.trim().length >= 2,
    select: (items: any[]) =>
      items.filter((p) =>
        [p.title, p.description].filter(Boolean).join(' ').toLowerCase().includes(q.trim().toLowerCase())
      ),
  });

  const loading = tasksQuery.isFetching || projectsQuery.isFetching;

  const topTasks = useMemo(() => (tasksQuery.data || []).slice(0, 5), [tasksQuery.data]);
  const topProjects = useMemo(() => (projectsQuery.data || []).slice(0, 5), [projectsQuery.data]);

  return (
    <div ref={boxRef} className="relative">
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => {
          const v = e.target.value;
          setQ(v);
          setOpen(v.trim().length >= 2);
        }}
        placeholder="Search projects and tasks..."
        className="w-full rounded-full border px-4 py-2 pl-10 bg-white/70 dark:bg-[#0f0f15]"
      />
      <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔎</span>

      {open && (
        <div className="absolute z-30 mt-2 w-[32rem] max-w-[80vw] rounded-xl border bg-white dark:bg-[#0f0f15] shadow-lg overflow-hidden">
          <div className="max-h-96 overflow-auto divide-y">
            <div className="p-3">
              <div className="text-xs font-semibold text-gray-500 mb-2">Projects</div>
              {loading && <div className="text-sm text-gray-500">Searching...</div>}
              {!loading && topProjects.length === 0 && (
                <div className="text-sm text-gray-500">No matching projects</div>
              )}
              <div className="grid">
                {topProjects.map((p) => (
                  <a key={p._id} href={`/projects/${p._id}`} className="rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#1b1b26]">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 to-sky-500" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{p.title}</div>
                        <div className="text-xs text-gray-500 truncate">{p.description}</div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <div className="p-3">
              <div className="text-xs font-semibold text-gray-500 mb-2">Tasks</div>
              {loading && <div className="text-sm text-gray-500">Searching...</div>}
              {!loading && topTasks.length === 0 && (
                <div className="text-sm text-gray-500">No matching tasks</div>
              )}
              <div className="grid">
                {topTasks.map((t) => (
                  <a key={t._id} href={`/tasks/${t._id}`} className="rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#1b1b26]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{t.title}</div>
                        <div className="text-xs text-gray-500 truncate">{t.project?.title || '—'}</div>
                      </div>
                      <div className="text-xs text-gray-500">{new Date(t.dueDate).toLocaleDateString()}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
