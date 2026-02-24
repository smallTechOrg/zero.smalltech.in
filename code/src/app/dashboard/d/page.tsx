'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import DashboardPage from '../dashboardPage';
import { useFetchLeads } from '../useLeads';
import { domainHash } from '../domainHash';

/**
 * Domain-filtered dashboard.
 *
 * URL: /dashboard/d?h=<8-char-hex>
 *
 * The hex token is the FNV-1a hash of a domain string.
 * All leads are fetched, then filtered client-side to only
 * those whose domain hashes to the provided token.
 */

function DomainDashboardContent() {
  const searchParams = useSearchParams();
  const hash = searchParams.get('h');
  const { rows } = useFetchLeads();

  const { filteredRows, matchingDomain } = useMemo(() => {
    if (!hash || rows.length === 0) return { filteredRows: [], matchingDomain: undefined };
    const match = rows.find(r => domainHash(r.domain) === hash);
    if (!match) return { filteredRows: [], matchingDomain: undefined };
    const domain = match.domain;
    return {
      filteredRows: rows.filter(r => r.domain === domain),
      matchingDomain: domain,
    };
  }, [hash, rows]);

  if (!hash) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-white/80 text-lg font-medium">Invalid Link</div>
          <div className="text-white/40 text-sm">No domain hash provided in the URL.</div>
        </div>
      </div>
    );
  }

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

  if (!matchingDomain) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-white/80 text-lg font-medium">No Data Found</div>
          <div className="text-white/40 text-sm">No leads match this domain link.</div>
        </div>
      </div>
    );
  }

  return <DashboardPage initialRows={filteredRows} domainFilter={matchingDomain} />;
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
      <DomainDashboardContent />
    </Suspense>
  );
}
