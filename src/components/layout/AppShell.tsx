"use client";

import Sidebar from './Sidebar';
import Footer from './Footer';
import TopBar from './TopBar';
import { useAuth } from '@/hooks/useAuth';

export default function AppShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const { meQuery, logout } = useAuth();
  return (
    <div className="min-h-dvh flex bg-gradient-to-b from-indigo-50/60 via-white to-white">
      <Sidebar />
      <div className="flex-1 flex min-w-0">
        <div className="w-full min-w-0">
          <TopBar title={title} />
          <main className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
