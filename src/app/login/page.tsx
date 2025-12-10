"use client";

import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';

type Form = { email: string; password: string };

export default function LoginPage() {
  const { register: rf, handleSubmit } = useForm<Form>();
  const { login, meQuery } = useAuth();

  if (meQuery.data) {
    if (typeof window !== 'undefined') window.location.href = '/dashboard';
    return null;
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit((d) => login.mutate(d))}
        className="w-full max-w-md space-y-4 rounded-lg border p-6 bg-white text-black"
      >
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <div className="space-y-1">
          <label className="text-sm">Email</label>
          <input
            type="email"
            {...rf('email', { required: true })}
            className="w-full rounded-md border px-3 py-2"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <input
            type="password"
            {...rf('password', { required: true })}
            className="w-full rounded-md border px-3 py-2"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-black text-white py-2 hover:opacity-90 disabled:opacity-50"
          disabled={login.isPending}
        >
          {login.isPending ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="text-sm text-center">
          No account? <a className="underline" href="/register">Create one</a>
        </p>
      </form>
    </div>
  );
}
