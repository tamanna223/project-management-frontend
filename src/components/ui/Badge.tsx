import { ReactNode } from 'react';

export function Badge({ children, color = 'gray' }: { children: ReactNode; color?: 'gray'|'green'|'red'|'yellow'|'blue'|'indigo' }) {
  const map: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    red: 'bg-rose-100 text-rose-700 border-rose-200',
    yellow: 'bg-amber-100 text-amber-800 border-amber-200',
    blue: 'bg-sky-100 text-sky-700 border-sky-200',
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${map[color]}`}>{children}</span>
  );
}
