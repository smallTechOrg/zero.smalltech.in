'use client';


import DashboardPage from './dashboardPage';
import { useFetchLeads } from './useLeads';

export default function Page() {
  const { rows } = useFetchLeads();

  return rows.length === 0 ? (
  <div className="text-white">Loading...</div>
) : (
  <DashboardPage initialRows={rows} />
);

}
