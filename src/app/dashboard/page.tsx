"use client";

import AppShell from '@/components/layout/AppShell';
import AnalyticsCards from '@/components/dashboard/AnalyticsCards';
import LineMiniCard from '@/components/dashboard/LineMiniCard';
import BarMiniCard from '@/components/dashboard/BarMiniCard';
import DonutMiniCard from '@/components/dashboard/DonutMiniCard';
import Drilldown, { type DrillKey } from '@/components/dashboard/Drilldown';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export default function DashboardPage() {
  const { meQuery } = useAuth();
  const [selected, setSelected] = useState<DrillKey | undefined>(undefined);

  if (!meQuery.isLoading && !meQuery.data) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Overview</h1>
        </div>
        <AnalyticsCards onSelect={(k) => setSelected(k)} />
        <div className="grid gap-6 lg:grid-cols-3">
          <LineMiniCard />
          <BarMiniCard />
          <DonutMiniCard />
        </div>
        <Drilldown selected={selected} />
      </div>
    </AppShell>
  );
}
