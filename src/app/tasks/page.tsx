"use client";

import AppShell from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import TaskFilters, { TaskFiltersState } from '@/components/tasks/TaskFilters';
import { Badge } from '@/components/ui/Badge';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useMemo, useState } from 'react';

function StatusBadge({ status }: { status: string }) {
  const color = status === 'completed' ? 'green' : status === 'in-progress' ? 'indigo' : 'gray';
  return <Badge color={color as any}>{status}</Badge>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const color = priority === 'high' ? 'red' : priority === 'medium' ? 'yellow' : 'blue';
  return <Badge color={color as any}>{priority}</Badge>;
}

export default function TasksIndexPage() {
  const [filters, setFilters] = useState<TaskFiltersState>({});
  const [sort, setSort] = useState<'dueAsc'|'dueDesc'|'priority'|'status'>('dueAsc');

  const queryParams = useMemo(() => ({ ...filters }), [filters]);

  const tasks = useQuery({
    queryKey: ['tasks', queryParams],
    queryFn: async () => (await api.get('/tasks', { params: queryParams })).data.data as any[],
  });

  const sorted = useMemo(() => {
    const arr = [...(tasks.data || [])];
    if (sort === 'dueAsc') arr.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    if (sort === 'dueDesc') arr.sort((a: any, b: any) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    if (sort === 'priority') {
      const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
      arr.sort((a: any, b: any) => (order[a.priority] ?? 99) - (order[b.priority] ?? 99));
    }
    if (sort === 'status') {
      const order: Record<string, number> = { 'in-progress': 0, todo: 1, completed: 2 };
      arr.sort((a: any, b: any) => (order[a.status] ?? 99) - (order[b.status] ?? 99));
    }
    return arr;
  }, [tasks.data, sort]);

  return (
    <AppShell title="Tasks">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <a href="/tasks/new" className="rounded-md bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700">New Task</a>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <TaskFilters initial={filters} onChange={setFilters} />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Quick:</span>
                  <button 
                    onClick={() => setFilters({ status: 'todo' })} 
                    className={`rounded-full px-3 py-1 border border-gray-300 dark:border-gray-600 font-medium text-sm transition-colors ${filters.status === 'todo' 
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    To do
                  </button>
                  <button 
                    onClick={() => setFilters({ status: 'in-progress' })} 
                    className={`rounded-full px-3 py-1 border border-gray-300 dark:border-gray-600 font-medium text-sm transition-colors ${filters.status === 'in-progress' 
                      ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    In progress
                  </button>
                  <button 
                    onClick={() => setFilters({ status: 'completed' })} 
                    className={`rounded-full px-3 py-1 border border-gray-300 dark:border-gray-600 font-medium text-sm transition-colors ${filters.status === 'completed' 
                      ? 'bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    Completed
                  </button>
                  <button 
                    onClick={() => setFilters({ priority: 'high' })} 
                    className={`rounded-full px-3 py-1 border border-gray-300 dark:border-gray-600 font-medium text-sm transition-colors ${filters.priority === 'high' 
                      ? 'bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    High Priority
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600 dark:text-gray-300">Sort:</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="rounded-md border px-2 py-1 bg-white dark:bg-[#1b1b26] text-gray-700 dark:text-gray-200">
                    <option value="dueAsc">Due ↑</option>
                    <option value="dueDesc">Due ↓</option>
                    <option value="priority">Priority</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {tasks.isLoading ? (
          <Card><CardContent>Loading tasks...</CardContent></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {sorted.map((t) => (
              <a key={t._id} href={`/tasks/${t._id}`} className="rounded-2xl border bg-white/95 dark:bg-[#181826] p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-400" />
                    <div className="font-medium truncate text-gray-900 dark:text-gray-100">{t.title}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-2">{t.description}</p>
                <div className="text-xs text-gray-500 mt-3 flex items-center justify-between">
                  <span>Due: {new Date(t.dueDate).toLocaleDateString()}</span>
                  {t.project?.title && <span className="truncate max-w-[160px] text-right">{t.project.title}</span>}
                </div>
              </a>
            ))}
            {!sorted.length && (
              <Card><CardContent>No tasks found. Try adjusting filters.</CardContent></Card>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
