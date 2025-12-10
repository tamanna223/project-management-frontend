type Stats = {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  highPriority: number;
  dueThisWeek: number;
};

export default function DashboardStats({ stats }: { stats?: Stats }) {
  const items = [
    { label: 'Total', value: stats?.total ?? 0 },
    { label: 'Completed', value: stats?.completed ?? 0 },
    { label: 'In Progress', value: stats?.inProgress ?? 0 },
    { label: 'To do', value: stats?.todo ?? 0 },
    { label: 'High Priority', value: stats?.highPriority ?? 0 },
    { label: 'Due This Week', value: stats?.dueThisWeek ?? 0 },
  ];
  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((it) => (
        <div key={it.label} className="rounded-lg border bg-white p-4 text-black">
          <p className="text-xs text-gray-500">{it.label}</p>
          <p className="text-2xl font-semibold">{it.value}</p>
        </div>
      ))}
    </section>
  );
}
