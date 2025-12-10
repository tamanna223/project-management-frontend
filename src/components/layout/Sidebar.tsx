"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  HomeIcon,
  FolderIcon,
  ClipboardIcon,
  CalendarIcon,
  BoltIcon,
  Cog6ToothIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline';

type NavItem = { href: string; label: string; Icon: any };
const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', Icon: HomeIcon },
  { href: '/projects', label: 'All Projects', Icon: FolderIcon },
  { href: '/tasks', label: 'My Tasks', Icon: ClipboardIcon }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    const input = document.getElementById('__theme_toggle') as HTMLInputElement | null;
    if (input) input.click();
    setDark((v) => !v);
  };

  return (
    <aside
      className={`hidden md:flex shrink-0 border-r bg-white/80 dark:bg-[#0f0f15]/70 backdrop-blur transition-[width] duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col w-full">
        <div className="h-14 border-b flex items-center justify-between px-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-400" />
            {!collapsed && <span className="font-semibold">Project Manager</span>}
          </Link>
          <button
            className="h-8 w-8 grid place-content-center rounded-md hover:bg-gray-100 dark:hover:bg-[#1b1b26]"
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? (
              <ChevronDoubleRightIcon className="h-5 w-5" />
            ) : (
              <ChevronDoubleLeftIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="p-2 space-y-1 flex-1">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 border border-indigo-200/60'
                    : 'hover:bg-gray-50 dark:hover:bg-[#1b1b26]'
                }`}
                title={collapsed ? label : undefined}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-500'}`} />
                {!collapsed && <span className="flex-1">{label}</span>}
                {active && <span className="ml-auto h-4 w-1 rounded bg-indigo-600/70 dark:bg-indigo-400/70" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-2 border-t space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-[#1b1b26]"
            title={collapsed ? 'Theme' : undefined}
          >
            {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            {!collapsed && <span>Theme: {dark ? 'Dark' : 'Light'}</span>}
          </button>
          <button
            onClick={() => logout.mutate()}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-[#1b1b26]"
            title={collapsed ? 'Logout' : undefined}
          >
            <span className="h-5 w-5 grid place-content-center">⎋</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
