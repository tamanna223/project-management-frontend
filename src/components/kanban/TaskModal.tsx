"use client";

import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

function ToolbarButton({ label, cmd }: { label: string; cmd: string }) {
  return (
    <button
      type="button"
      className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-[#1b1b26]"
      onClick={() => {
        try {
          document.execCommand(cmd, false);
        } catch {}
      }}
      title={label}
      aria-label={label}
    >
      {label}
    </button>
  );
}

export default function TaskModal({ taskId, open, onClose }: { taskId?: string; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();

  const task = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => (await api.get(`/tasks/${taskId}`)).data.data as any,
    enabled: !!taskId && open,
  });

  const { register, handleSubmit, reset } = useForm({
    values: task.data
      ? {
          title: task.data.title,
          status: task.data.status,
          priority: task.data.priority,
          dueDate: toInputDate(task.data.dueDate),
        }
      : undefined,
  });

  // Rich text editor state for description
  const [descHtml, setDescHtml] = useState<string>('');
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (task.data) {
      setDescHtml(String(task.data.description || ''));
    }
  }, [task.data]);

  useEffect(() => {
    if (task.data) {
      reset({
        title: task.data.title,
        status: task.data.status,
        priority: task.data.priority,
        dueDate: toInputDate(task.data.dueDate),
      });
    }
  }, [task.data, reset]);

  const save = useMutation({
    mutationFn: async (d: any) =>
      (await api.put(`/tasks/${taskId}`, { ...d, description: descHtml, dueDate: new Date(d.dueDate).toISOString() })).data,
    onSuccess: async () => {
      await qc.invalidateQueries();
      onClose();
    },
  });

  // Activity log (local-only demo). Persist per-task in localStorage
  const storageKey = useMemo(() => (taskId ? `task-activity:${taskId}` : ''), [taskId]);
  const [comment, setComment] = useState('');
  const [activity, setActivity] = useState<Array<{ text: string; ts: number }>>([]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setActivity(JSON.parse(raw));
    } catch {}
  }, [storageKey, open]);

  const addComment = () => {
    if (!comment.trim()) return;
    const next = [{ text: comment.trim(), ts: Date.now() }, ...activity].slice(0, 100);
    setActivity(next);
    setComment('');
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30">
      <div className="w-[clamp(320px,95vw,900px)] rounded-2xl border bg-white dark:bg-[#0f0f15] p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Task</h3>
          <button onClick={onClose} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-[#1b1b26]">Close</button>
        </div>
        {task.isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <form onSubmit={handleSubmit((d) => save.mutate(d))} className="grid gap-3 lg:col-span-2">
              <input className="w-full border rounded-md px-3 py-2" placeholder="Title" {...register('title', { required: true })} />

              {/* Rich text editor */}
              <div className="rounded-lg border">
                <div className="flex items-center gap-1 px-2 py-1 border-b bg-white/70 dark:bg-[#0f0f15]">
                  <ToolbarButton label="B" cmd="bold" />
                  <ToolbarButton label="I" cmd="italic" />
                  <ToolbarButton label="U" cmd="underline" />
                  <ToolbarButton label="•" cmd="insertUnorderedList" />
                  <ToolbarButton label="1." cmd="insertOrderedList" />
                </div>
                <div
                  ref={editorRef}
                  className="min-h-[140px] max-h-[320px] overflow-auto px-3 py-2 focus:outline-none prose prose-sm dark:prose-invert"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => setDescHtml((e.target as HTMLDivElement).innerHTML)}
                  dangerouslySetInnerHTML={{ __html: descHtml }}
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <select className="w-full border rounded-md px-3 py-2" {...register('status', { required: true })}>
                  <option value="todo">To do</option>
                  <option value="in-progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select className="w-full border rounded-md px-3 py-2" {...register('priority', { required: true })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input type="date" className="w-full border rounded-md px-3 py-2" {...register('dueDate', { required: true })} />
              </div>
              <div className="flex items-center gap-2">
                <button type="submit" className="rounded-md bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700 disabled:opacity-50" disabled={save.isPending}>
                  {save.isPending ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
              </div>
            </form>

            {/* Activity log */}
            <div className="rounded-xl border bg-white/70 dark:bg-[#0f0f15] p-3 h-full">
              <div className="text-sm font-semibold mb-2">Activity</div>
              <div className="flex gap-2 mb-2">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 rounded-md border px-3 py-2"
                />
                <button onClick={addComment} className="rounded-md bg-indigo-600 text-white px-3 py-2 text-sm hover:bg-indigo-700">Post</button>
              </div>
              <div className="grid gap-2 max-h-72 overflow-auto">
                {activity.map((c, idx) => (
                  <div key={c.ts} className="rounded-lg border px-3 py-2 bg-white dark:bg-[#141421] animate-[fadeIn_.25s_ease]">
                    <div className="text-xs text-gray-500">{new Date(c.ts).toLocaleString()}</div>
                    <div className="text-sm">{c.text}</div>
                  </div>
                ))}
                {activity.length === 0 && <div className="text-sm text-gray-500">No activity yet.</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function toInputDate(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
