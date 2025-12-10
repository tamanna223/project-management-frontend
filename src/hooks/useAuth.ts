"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export function useAuth() {
  const qc = useQueryClient();

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.data;
    },
    retry: false,
  });

  const login = useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const res = await api.post('/auth/login', payload);
      return res.data;
    },
    onSuccess: async () => {
      toast.success('Logged in');
      await qc.invalidateQueries({ queryKey: ['me'] });
      window.location.href = '/dashboard';
    },
    onError: () => toast.error('Invalid credentials'),
  });

  const register = useMutation({
    mutationFn: async (payload: { name: string; email: string; password: string }) => {
      const res = await api.post('/auth/register', payload);
      return res.data;
    },
    onSuccess: async () => {
      toast.success('Account created');
      await qc.invalidateQueries({ queryKey: ['me'] });
      window.location.href = '/dashboard';
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/logout');
      return res.data;
    },
    onSuccess: async () => {
      toast.success('Logged out');
      await qc.invalidateQueries({ queryKey: ['me'] });
      window.location.href = '/login';
    },
  });

  return { meQuery, login, register, logout };
}
