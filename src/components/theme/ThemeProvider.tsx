"use client";

import { useEffect, useState } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (typeof window !== 'undefined' && (localStorage.getItem('theme') as any)) || 'light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div>
      <input type="checkbox" id="__theme_toggle" className="hidden" onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')} checked={theme === 'dark'} />
      {children}
    </div>
  );
}
