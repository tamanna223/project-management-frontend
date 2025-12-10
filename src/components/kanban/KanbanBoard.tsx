"use client";

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import TaskModal from './TaskModal';

const STATUSES = [
  { key: 'todo', label: 'Todo' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
] as const;

type StatusKey = typeof STATUSES[number]['key'];

export default function KanbanBoard({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const [openTaskId, setOpenTaskId] = useState<string | undefined>();

  const tasks = useQuery({
    queryKey: ['tasks', { project: projectId }],
    queryFn: async () => (await api.get('/tasks', { params: { project: projectId } })).data.data as any[],
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusKey }) =>
      (await api.put(`/tasks/${id}`, { status })).data,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['tasks', { project: projectId }] });
    },
  });

  const grouped = useMemo(() => {
    const g: Record<StatusKey, any[]> = {
      'todo': [],
      'in-progress': [],
      'completed': [],
    } as any;
    (tasks.data || []).forEach((t) => g[t.status as StatusKey]?.push(t));
    return g;
  }, [tasks.data]);

  const onDropColumn = (status: StatusKey, e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) updateStatus.mutate({ id, status });
  };

  const onDragStart = (id: string, e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {STATUSES.map((col) => (
        <div
          key={col.key}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDropColumn(col.key, e)}
          className="rounded-2xl border bg-white/80 dark:bg-[#0f0f15]/60 backdrop-blur p-3 shadow-sm min-h-[300px]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">
              {col.label} <span className="text-xs text-gray-500">({grouped[col.key]?.length || 0})</span>
            </div>
          </div>
          <div className="space-y-2">
            {grouped[col.key]?.map((t) => (
              <div
                key={t._id}
                draggable
                onDragStart={(e) => onDragStart(t._id, e)}
                onClick={() => setOpenTaskId(t._id)}
                className="rounded-xl border bg-white dark:bg-[#0f0f15] p-3 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium truncate text-gray-900 dark:text-white">{t.title}</div>
                  <span className={`text-xs rounded-full px-2 py-0.5 ${
                    t.priority === 'high' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' 
                      : t.priority === 'medium' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                  }`}>
                    {t.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">{t.description}</p>
                <div className="text-[11px] text-gray-600 dark:text-gray-400 mt-2 flex items-center justify-between">
                  <span>Due: {new Date(t.dueDate).toLocaleDateString()}</span>
                  {t.project?.title && <span className="text-gray-600 dark:text-gray-300">{t.project.title}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <TaskModal taskId={openTaskId} open={!!openTaskId} onClose={() => setOpenTaskId(undefined)} />
    </div>
  );
}
