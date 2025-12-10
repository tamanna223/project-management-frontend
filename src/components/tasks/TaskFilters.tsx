"use client";

import { useState, useEffect } from 'react';

export type TaskFiltersState = {
  status?: string;
  priority?: string;
  search?: string;
};

export default function TaskFilters({
  initial,
  onChange,
}: {
  initial?: TaskFiltersState;
  onChange: (filters: TaskFiltersState) => void;
}) {
  const [status, setStatus] = useState(initial?.status || "");
  const [priority, setPriority] = useState(initial?.priority || "");
  const [search, setSearch] = useState(initial?.search || "");

  useEffect(() => {
    const t = setTimeout(() => onChange({ status: empty(status), priority: empty(priority), search: empty(search) }), 250);
    return () => clearTimeout(t);
  }, [status, priority, search]);

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="grid gap-1">
        <label className="text-xs text-gray-600 dark:text-gray-300">Search</label>
        <input
          placeholder="Search tasks..."
          className="w-full rounded-md border px-3 py-2 bg-white dark:bg-[#1b1b26] text-black dark:text-white placeholder:text-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs text-gray-600 dark:text-gray-300">Status</label>
        <select className="w-full rounded-md border px-3 py-2 bg-white dark:bg-[#1b1b26] text-black dark:text-white" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All status</option>
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="grid gap-1">
        <label className="text-xs text-gray-600 dark:text-gray-300">Priority</label>
        <select className="w-full rounded-md border px-3 py-2 bg-white dark:bg-[#1b1b26] text-black dark:text-white" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </div>
  );
}

function empty(v?: string) {
  return v && v.length ? v : undefined;
}
