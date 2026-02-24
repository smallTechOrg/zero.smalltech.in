'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import DashboardPage from './dashboardPage';
import { useFetchLeads } from './useLeads';

const ACCESS_KEY = 'khuljasimsim';

function DashboardContent() {
  const searchParams = useSearchParams();
  const key = searchParams.get('h');

  if (key !== ACCESS_KEY) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-white/80 text-lg font-medium">Access Denied</div>
          <div className="text-white/40 text-sm">Invalid or missing access key.</div>
        </div>
      </div>
    );
  }

  return <AuthenticatedDashboard />;
}

function AuthenticatedDashboard() {
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

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy flex items-center justify-center">
          <div className="flex items-center gap-3 text-white/60">
            <span className="animate-pulse text-pacific text-lg">●</span>
            Loading…
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
