'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useLeads, LeadStatus, LeadRowData } from './useLeads';
import { domainHash } from './domainHash';
import { analytics } from '@/app/lib/analytics';

/* ── Constants ─────────────────────────────────────────────────── */

const PAGE_SIZE = 20;

const STATUS_CONFIG = {
  OPEN:       { label: 'Open',       bg: 'bg-pacific/15',   text: 'text-pacific',   border: 'border-pacific/30',   dot: 'bg-pacific' },
  QUALIFYING: { label: 'Qualifying', bg: 'bg-amber/15',     text: 'text-amber',     border: 'border-amber/30',     dot: 'bg-amber' },
  CLOSED:     { label: 'Closed',     bg: 'bg-tangerine/15', text: 'text-tangerine', border: 'border-tangerine/30', dot: 'bg-tangerine' },
} as const;

/* ── Inline SVG Icons ──────────────────────────────────────────── */

const SearchIcon = () => (
  <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

/* ── Props ──────────────────────────────────────────────────────── */

interface DashboardPageProps {
  initialRows: LeadRowData[];
  domainFilter?: string;
}

/* ── Main Component ────────────────────────────────────────────── */

export default function DashboardPage({ initialRows, domainFilter }: DashboardPageProps) {
  const {
    rows: allRows,
    error,
    saving,
    expanded,
    setExpanded,
    onChangeStatus,
    onSaveRemarks,
    onToggleActive,
    histories,
    historyLoading,
    historyError,
    loadHistory,
  } = useLeads(initialRows);

  /* ── UI state ── */
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  /* ── Filtered rows ── */
  const filteredRows = useMemo(() => {
    let rows = allRows;
    if (domainFilter) rows = rows.filter(r => r.domain === domainFilter);
    if (statusFilter !== 'ALL') rows = rows.filter(r => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.domain?.toLowerCase().includes(q) ||
        r.session_id?.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [allRows, domainFilter, statusFilter, search]);

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

  /* ── Analytics-aware search handler ── */
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  useEffect(() => {
    if (search.trim().length > 2) {
      const timer = setTimeout(() => {
        analytics.track('dashboard_search', {
          query_length: search.trim().length,
          result_count: filteredRows.length,
        });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [search, filteredRows.length]);

  const handleStatusFilter = useCallback((status: LeadStatus | 'ALL') => {
    setStatusFilter(status);
    // We schedule the analytics call so filteredRows re-computes first
    setTimeout(() => {
      analytics.track('dashboard_status_filter', {
        status,
        result_count: filteredRows.length,
      });
    }, 0);
  }, [filteredRows.length]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedRows = filteredRows.slice(startIndex, startIndex + PAGE_SIZE);

  const goToPage = (page: number, direction: 'first' | 'prev' | 'next' | 'last' | 'jump' = 'jump') => {
    const target = Math.min(Math.max(1, page), totalPages);
    analytics.track('dashboard_pagination', { page: target, total_pages: totalPages, direction });
    setCurrentPage(target);
    setExpanded({});
  };

  /* ── Stats ── */
  const stats = useMemo(() => {
    const base = domainFilter ? allRows.filter(r => r.domain === domainFilter) : allRows;
    return {
      total: base.length,
      open: base.filter(r => r.status === 'OPEN').length,
      qualifying: base.filter(r => r.status === 'QUALIFYING').length,
      closed: base.filter(r => r.status === 'CLOSED').length,
    };
  }, [allRows, domainFilter]);

  /* ── Unique domains for link generation ── */
  const uniqueDomains = useMemo(() => {
    const set = new Set(allRows.map(r => r.domain).filter(Boolean));
    return Array.from(set).sort();
  }, [allRows]);

  const copyDomainLink = (domain: string) => {
    const hash = domainHash(domain);
    const url = `${window.location.origin}/dashboard/d?h=${hash}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(domain);
      analytics.track('dashboard_domain_link_copy', { domain });
      setTimeout(() => setCopiedLink(null), 2000);
    });
  };

  /* ── Track dashboard view when stats change ── */
  useEffect(() => {
    if (stats.total > 0) {
      analytics.track('dashboard_view', {
        total_leads: stats.total,
        open_leads: stats.open,
        qualifying_leads: stats.qualifying,
        closed_leads: stats.closed,
        domain_filter: domainFilter,
      });
      analytics.pageView(
        domainFilter ? `/dashboard/d?domain=${domainFilter}` : '/dashboard',
        domainFilter ? `Dashboard — ${domainFilter}` : 'Dashboard',
      );
    }
  }, [stats.total, stats.open, stats.qualifying, stats.closed, domainFilter]);

  /* ── Table columns ── */
  const columns = useMemo<ColumnDef<LeadRowData>[]>(() => [
    {
      header: 'Lead',
      accessorKey: 'name',
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div>
            <div className="font-medium text-white">{r.name || '—'}</div>
            <div className="text-xs text-white/50 mt-0.5 font-mono">{r.session_id?.slice(0, 8)}…</div>
          </div>
        );
      },
    },
    {
      header: 'Contact',
      id: 'contact',
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="space-y-0.5">
            <div className="text-sm text-white/90">{r.email}</div>
            {r.mobile_number && <div className="text-xs text-white/50">{r.mobile_number}</div>}
            {r.country && <div className="text-xs text-white/50">{r.country}</div>}
          </div>
        );
      },
    },
    ...(!domainFilter ? [{
      header: 'Domain',
      accessorKey: 'domain',
      cell: ({ row }: { row: { original: LeadRowData } }) => {
        const d = row.original.domain;
        return (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/10 text-sky border border-white/10">
              {d}
            </span>
          </div>
        );
      },
    } as ColumnDef<LeadRowData>] : []),
    {
      header: 'Time',
      accessorKey: 'time',
      cell: ({ row }) => (
        <span className="text-sm text-white/60">{row.original.time}</span>
      ),
    },
    {
      header: 'Status',
      id: 'status',
      cell: ({ row }) => {
        const r = row.original;
        return (
          <StatusSelect
            value={r.status}
            onChange={(value) => onChangeStatus(r.session_id, value)}
          />
        );
      },
    },
    {
      header: 'Remarks',
      id: 'remarks',
      cell: ({ row }) => {
        const r = row.original;
        return (
          <RowRemarks
            sessionId={r.session_id}
            initialRemarks={r.remarks ?? ''}
            saving={!!saving[r.session_id]}
            onSave={onSaveRemarks}
          />
        );
      },
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => {
        const r = row.original;
        const isOpen = !!expanded[r.session_id];
        const isConfirmingDelete = deleteConfirm === r.session_id;
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isOpen
                  ? 'bg-pacific text-white shadow-sm shadow-pacific/20'
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-pacific/10 hover:text-pacific hover:border-pacific/30'
              }`}
              onClick={() => {
                setExpanded((e) => ({ ...e, [r.session_id]: !isOpen }));
                analytics.track('dashboard_chat_history_view', {
                  session_id: r.session_id,
                  action: isOpen ? 'collapse' : 'expand',
                });
                if (!isOpen && !histories[r.session_id] && !historyLoading[r.session_id]) {
                  loadHistory(r.session_id);
                }
              }}
            >
              <ChatIcon />
              {isOpen ? 'Hide' : 'History'}
            </button>
            {isConfirmingDelete ? (
              <div className="inline-flex items-center gap-1 bg-amber/10 border border-amber/30 rounded-lg px-2 py-1">
                <span className="text-xs text-amber whitespace-nowrap">Delete?</span>
                <button
                  type="button"
                  className="px-2 py-0.5 rounded text-xs font-medium bg-amber text-navy hover:bg-amber/80 transition-colors"
                  onClick={() => { analytics.track('dashboard_lead_delete', { session_id: r.session_id, domain: r.domain }); onToggleActive(r.session_id, false); setDeleteConfirm(null); }}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className="px-2 py-0.5 rounded text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  onClick={() => setDeleteConfirm(null)}
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                title="Delete lead"
                className="p-1.5 rounded-md text-white/30 hover:text-amber hover:bg-amber/10 transition-colors"
                onClick={() => setDeleteConfirm(r.session_id)}
              >
                <TrashIcon />
              </button>
            )}
          </div>
        );
      },
    },
  ], [expanded, histories, historyLoading, onChangeStatus, onSaveRemarks, onToggleActive, setExpanded, loadHistory, saving, domainFilter, copiedLink, deleteConfirm]);

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(next);
      if (next.length > 0) {
        analytics.track('dashboard_sort', {
          column: next[0].id,
          direction: next[0].desc ? 'desc' : 'asc',
        });
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  /* ── Status filter tabs ── */
  const statusTabs: { key: LeadStatus | 'ALL'; label: string; count: number }[] = [
    { key: 'ALL',        label: 'All Leads',  count: stats.total },
    { key: 'OPEN',       label: 'Open',       count: stats.open },
    { key: 'QUALIFYING', label: 'Qualifying', count: stats.qualifying },
    { key: 'CLOSED',     label: 'Closed',     count: stats.closed },
  ];

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-navy">
      {/* ── Header ── */}
      <header className="border-b border-white/10 bg-navy/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight">
                Zer0 Dashboard
              </h1>
              <p className="text-sm text-white/50 mt-0.5">
                {domainFilter
                  ? <>Leads for <span className="text-pacific font-medium">{domainFilter}</span></>
                  : 'Manage and track all your leads'
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              {domainFilter && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-pacific/15 text-pacific border border-pacific/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-pacific animate-pulse" />
                  {domainFilter}
                </span>
              )}
              {!domainFilter && uniqueDomains.length > 0 && (
                <DomainMenu domains={uniqueDomains} onCopyLink={copyDomainLink} copiedLink={copiedLink} />
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ── Error banner ── */}
        {error && (
          <div className="rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-amber flex items-center gap-2">
            <span>⚠</span> {error}
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Leads" value={stats.total} icon={<UsersIcon />} color="text-sky" bgColor="bg-sky/10" />
          <StatCard label="Open" value={stats.open} icon={<span className="w-2.5 h-2.5 rounded-full bg-pacific" />} color="text-pacific" bgColor="bg-pacific/10" />
          <StatCard label="Qualifying" value={stats.qualifying} icon={<span className="w-2.5 h-2.5 rounded-full bg-amber" />} color="text-amber" bgColor="bg-amber/10" />
          <StatCard label="Closed" value={stats.closed} icon={<span className="w-2.5 h-2.5 rounded-full bg-tangerine" />} color="text-tangerine" bgColor="bg-tangerine/10" />
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search leads…"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-pacific/50 focus:border-pacific/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            {statusTabs.map(tab => (
              <button
                key={tab.key}
                type="button"
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === tab.key
                    ? 'bg-pacific text-white shadow-sm'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
                onClick={() => handleStatusFilter(tab.key)}
              >
                {tab.label}
                <span className={`ml-1.5 ${statusFilter === tab.key ? 'text-white/70' : 'text-white/30'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Table (Desktop) ── */}
        <div className="hidden md:block rounded-xl border border-white/10 overflow-hidden">
          <table className="min-w-full">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-white/[0.04]">
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-white/5">
              {table.getRowModel().rows.slice(startIndex, startIndex + PAGE_SIZE).map(row => {
                const original = row.original;
                const isOpen = !!expanded[original.session_id];
                return (
                  <React.Fragment key={row.id}>
                    <tr className="hover:bg-white/[0.03] transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-4 py-3 text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={row.getVisibleCells().length} className="px-4 py-0">
                          <ChatHistoryPanel
                            sessionId={original.session_id}
                            loading={!!historyLoading[original.session_id]}
                            error={historyError[original.session_id]}
                            messages={histories[original.session_id] || []}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {pagedRows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-white/40">
                    {search || statusFilter !== 'ALL' ? 'No leads match your filters.' : 'No leads yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Cards ── */}
        <div className="md:hidden space-y-3">
          {pagedRows.map(r => {
            const isOpen = !!expanded[r.session_id];
            const config = STATUS_CONFIG[r.status];
            return (
              <div key={r.session_id} className="rounded-xl border border-white/10 p-4 space-y-3">
                {/* Card header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-white">{r.name || '—'}</div>
                    <div className="text-xs text-white/40 font-mono mt-0.5">{r.session_id?.slice(0, 8)}…</div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                    {config.label}
                  </span>
                </div>

                {/* Contact info */}
                <div className="text-sm text-white/70 space-y-0.5">
                  <div>{r.email}</div>
                  {r.mobile_number && <div className="text-xs text-white/50">{r.mobile_number}</div>}
                  {r.country && <div className="text-xs text-white/50">{r.country}</div>}
                  {!domainFilter && (
                    <div className="inline-flex items-center gap-1.5 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/10 text-sky border border-white/10">
                        {r.domain}
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-white/40">{r.time}</div>
                </div>

                {/* Actions row */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                  <StatusSelect
                    value={r.status}
                    onChange={value => onChangeStatus(r.session_id, value)}
                  />
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isOpen
                        ? 'bg-pacific text-white shadow-sm shadow-pacific/20'
                        : 'bg-white/5 text-white/60 border border-white/10 hover:bg-pacific/10 hover:text-pacific hover:border-pacific/30'
                    }`}
                    onClick={() => {
                      setExpanded(e => ({ ...e, [r.session_id]: !isOpen }));
                      if (!isOpen && !histories[r.session_id] && !historyLoading[r.session_id]) {
                        loadHistory(r.session_id);
                      }
                    }}
                  >
                    <ChatIcon />
                    {isOpen ? 'Hide' : 'History'}
                  </button>
                  {deleteConfirm === r.session_id ? (
                    <div className="inline-flex items-center gap-1 bg-amber/10 border border-amber/30 rounded-lg px-2 py-1">
                      <span className="text-xs text-amber">Delete?</span>
                      <button
                        type="button"
                        className="px-2 py-0.5 rounded text-xs font-medium bg-amber text-navy hover:bg-amber/80 transition-colors"
                        onClick={() => { onToggleActive(r.session_id, false); setDeleteConfirm(null); }}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className="px-2 py-0.5 rounded text-xs font-medium text-white/60 hover:text-white transition-colors"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      title="Delete"
                      className="p-1.5 rounded-md text-white/30 hover:text-amber hover:bg-amber/10 transition-colors"
                      onClick={() => setDeleteConfirm(r.session_id)}
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>

                {/* Remarks */}
                <RowRemarks
                  sessionId={r.session_id}
                  initialRemarks={r.remarks ?? ''}
                  saving={!!saving[r.session_id]}
                  onSave={onSaveRemarks}
                />

                {/* Expanded chat history */}
                {isOpen && (
                  <ChatHistoryPanel
                    sessionId={r.session_id}
                    loading={!!historyLoading[r.session_id]}
                    error={historyError[r.session_id]}
                    messages={histories[r.session_id] || []}
                  />
                )}
              </div>
            );
          })}
          {pagedRows.length === 0 && (
            <div className="text-center text-sm text-white/40 py-12">
              {search || statusFilter !== 'ALL' ? 'No leads match your filters.' : 'No leads yet.'}
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-white/40">
              Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, filteredRows.length)} of {filteredRows.length}
            </p>
            <div className="flex items-center gap-1">
              <PaginationButton onClick={() => goToPage(1, 'first')} disabled={currentPage === 1}>«</PaginationButton>
              <PaginationButton onClick={() => goToPage(currentPage - 1, 'prev')} disabled={currentPage === 1}>‹</PaginationButton>
              {paginationRange(currentPage, totalPages).map((p, i) =>
                p === '...' ? (
                  <span key={`e${i}`} className="px-2 text-white/30 text-xs">…</span>
                ) : (
                  <PaginationButton
                    key={p}
                    onClick={() => goToPage(p as number)}
                    active={p === currentPage}
                  >
                    {p}
                  </PaginationButton>
                )
              )}
              <PaginationButton onClick={() => goToPage(currentPage + 1, 'next')} disabled={currentPage === totalPages}>›</PaginationButton>
              <PaginationButton onClick={() => goToPage(totalPages, 'last')} disabled={currentPage === totalPages}>»</PaginationButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

function StatCard({ label, value, icon, color, bgColor }: {
  label: string; value: number; icon: React.ReactNode; color: string; bgColor: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center gap-4 hover:bg-white/[0.04] transition-colors">
      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${bgColor}`}>
        <span className={color}>{icon}</span>
      </div>
      <div>
        <div className={`text-2xl font-semibold tabular-nums ${color}`}>{value}</div>
        <div className="text-xs text-white/50">{label}</div>
      </div>
    </div>
  );
}

function DomainMenu({ domains, onCopyLink, copiedLink }: {
  domains: string[]; onCopyLink: (domain: string) => void; copiedLink: string | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <LinkIcon />
        Domain Links
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-lg border border-white/10 bg-navy shadow-lg z-30 py-1">
            <div className="px-3 py-2 text-xs text-white/40 border-b border-white/5">
              Copy a shareable link for domain-specific view
            </div>
            {domains.map(d => (
              <button
                key={d}
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/5 flex items-center justify-between transition-colors"
                onClick={() => onCopyLink(d)}
              >
                <span className="truncate">{d}</span>
                <span className="text-xs text-white/30 ml-2 flex-shrink-0">
                  {copiedLink === d ? '✓ Copied' : 'Copy'}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ChatHistoryPanel({ sessionId, loading, error, messages }: {
  sessionId: string; loading: boolean; error?: string; messages: { sender: string; text: string }[];
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 my-2 space-y-3">
      <div className="flex items-center gap-2 text-xs text-white/40">
        <ChatIcon />
        <span>Chat History</span>
        <span className="font-mono">({sessionId.slice(0, 8)}…)</span>
      </div>
      {loading && (
        <div className="flex items-center gap-2 text-sm text-white/50">
          <span className="animate-pulse">●</span> Loading history…
        </div>
      )}
      {!loading && error && (
        <div className="text-sm text-amber">{error}</div>
      )}
      {!loading && !error && messages.length === 0 && (
        <div className="text-sm text-white/40">No messages in this session.</div>
      )}
      {!loading && !error && messages.length > 0 && (
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-2">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                msg.sender === 'You'
                  ? 'bg-pacific/20 text-white self-end rounded-br-sm'
                  : 'bg-white/5 text-white/80 self-start rounded-bl-sm'
              }`}
            >
              <div className="text-[10px] text-white/40 mb-0.5">{msg.sender}</div>
              {msg.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RowRemarks({ sessionId, initialRemarks, saving, onSave }: {
  sessionId: string; initialRemarks: string; saving: boolean;
  onSave: (session_id: string, remarks: string) => Promise<void>;
}) {
  const [value, setValue] = useState(initialRemarks);
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => setValue(initialRemarks), [initialRemarks]);

  return (
    <div className="flex items-start gap-2 min-w-[160px]">
      {isEditing ? (
        <textarea
          className="w-full px-2.5 py-1.5 rounded-md bg-white/10 border border-white/20 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-pacific/50 resize-none"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Add remarks…"
          rows={2}
        />
      ) : (
        <div className="text-sm text-white/60 truncate max-w-[180px]" title={value || 'No remarks'}>
          {value || <span className="italic text-white/30">No remarks</span>}
        </div>
      )}
      {isEditing ? (
        <button
          type="button"
          className="px-2.5 py-1 rounded-md bg-pacific text-white text-xs font-medium hover:bg-pacific/80 disabled:opacity-50 transition-colors whitespace-nowrap"
          onClick={async () => { await onSave(sessionId, value); setIsEditing(false); }}
          disabled={saving}
        >
          {saving ? '…' : 'Save'}
        </button>
      ) : (
        <button
          type="button"
          title="Edit remarks"
          className="p-1 rounded-md text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors flex-shrink-0"
          onClick={() => setIsEditing(true)}
        >
          <EditIcon />
        </button>
      )}
    </div>
  );
}

function StatusSelect({ value, onChange }: {
  value: LeadStatus; onChange: (value: LeadStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const config = STATUS_CONFIG[value];
  const options: LeadStatus[] = ['OPEN', 'QUALIFYING', 'CLOSED'];

  return (
    <div className="relative">
      <button
        type="button"
        className={`inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-lg text-xs font-medium border transition-all hover:brightness-110 ${config.bg} ${config.text} ${config.border}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
        <ChevronDownIcon />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-1 w-36 rounded-lg border border-white/10 bg-navy shadow-xl z-30 py-1 overflow-hidden">
            {options.map(opt => {
              const c = STATUS_CONFIG[opt];
              const isActive = opt === value;
              return (
                <button
                  key={opt}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center gap-2 transition-colors ${
                    isActive ? `${c.bg} ${c.text}` : 'text-white/70 hover:bg-white/5'
                  }`}
                  onClick={() => { onChange(opt); setOpen(false); }}
                >
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  {c.label}
                  {isActive && <span className="ml-auto text-[10px]">✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function PaginationButton({ children, onClick, disabled, active }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[32px] h-8 px-2 rounded-md text-xs font-medium transition-colors ${
        active
          ? 'bg-pacific text-white'
          : disabled
            ? 'text-white/20 cursor-not-allowed'
            : 'text-white/50 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

/** Generates a compact page-number array with ellipsis markers */
function paginationRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}
