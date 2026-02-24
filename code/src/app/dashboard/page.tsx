'use client';

import DashboardPage from './dashboardPage';
import { useFetchLeads } from './useLeads';

export default function Page() {
  const { rows } = useFetchLeads();

  if (rows.length === 0) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/60">
          <span className="animate-pulse text-pacific text-lg">●</span>
          Loading dashboard…
        </div>
      </div>
    );
  }

  return <DashboardPage initialRows={rows} />;
}
