'use client';

import Dropdown from '@/app/components/common/dropdown';
import { useLeads, LeadStatus, LeadRowData } from './useLeads';
import { useEffect, useMemo, useState } from 'react';
import React from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';

// Pagination 
const PAGE_SIZE = 50;

const statusColors: Record<LeadStatus, string> = {
    OPEN: "text-pacific font-semibold",
    CLOSED: "text-tangerine font-semibold",
    QUALIFYING: "text-amber font-semibold",
};

export default function DashboardPage({ initialRows }: { initialRows: LeadRowData[] }) {
    const {
        rows,
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
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const pagedRows = rows.slice(startIndex, startIndex + PAGE_SIZE);

    //Pagination
    const goToPage = (page: number) => {
        const clamped = Math.min(Math.max(1, page), totalPages);
        setCurrentPage(() => clamped);
        // Reset expanded rows when changing page
        setExpanded({});
    };

    const headerClass =
        'px-4 py-3 text-left text-sm font-semibold text-white bg-navy';
    const cellClass =
        'px-4 py-3 text-sm text-white/90 border-t border-sky';

    const columns = useMemo<ColumnDef<LeadRowData>[]>(() => [
        {
            header: 'Session Id',
            accessorKey: 'session_id',
            cell: ({ row }) => {
                const r = row.original;
                const isOpen = !!expanded[r.session_id];

                return (
                    <>
                    <button
                        type="button"
                        className="hover:text-sky"
                        onClick={() => {
                            setExpanded((e) => ({ ...e, [r.session_id]: !isOpen }));
                            if (!isOpen && !histories[r.session_id] && !historyLoading[r.session_id]) {
                                loadHistory(r.session_id);
                            }
                        } }
                    >
                        {r.session_id ? `${r.session_id.slice(0, 5)}...` : ''}
                    </button>
                    <div>domain: {r.domain}</div>
                    <div>time: {r.time}</div>
                    </>
                );
            },
        },

        {
            header: 'Name',
            accessorKey: 'name',
            cell: ({ row }) => row.original.name,
        },
        {
            header: 'Contact Details',
            id: 'contact',
            cell: ({ row }) => {
                const r = row.original;
                return (
                    <div className="text-white/90">
                        <div>email: {r.email}</div>
                        <div>country: {r.country}</div>
                        <div>mobile: {r.mobile_number}</div>
                    </div>
                );
            },
        },
        {
            header: 'Status',
            id: 'status',
            cell: ({ row }) => {
                const r = row.original;
                return (
                    <div className={`w-44 ${statusColors[r.status]}`}>
                        <Dropdown<LeadStatus>
                            label={r.status}
                            options={[
                                { label: 'OPEN', value: 'OPEN' },
                                { label: 'CLOSED', value: 'CLOSED' },
                                { label: 'QUALIFYING', value: 'QUALIFYING' },
                            ]}
                            onSelect={(value) => onChangeStatus(r.session_id, value)}
                        />
                    </div>
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
            header: 'Delete',
            id: 'delete',
            cell: ({ row }) => {
                const r = row.original;
                return (
                    <DeleteButton
                        onClick={() => onToggleActive(r.session_id, false)}
                    />
                );
            },
        }
    ], [expanded, histories, historyLoading, onChangeStatus, onSaveRemarks, onToggleActive, setExpanded, loadHistory, saving]);

    const table = useReactTable({
        data: rows,
        columns,
        getCoreRowModel: getCoreRowModel(),
        autoResetPageIndex: false,
    });

    return (
        <section className="p-6">
            <h1 className="text-xl mb-4 text-white">Dashboard</h1>
            {error && <div className="mb-3 text-amber">{error}</div>}

            {/* Desktop table */}
            <div
                className="overflow-x-auto rounded-lg shadow-md hidden md:block bg-navy"
                >
                <table className="min-w-full">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className={headerClass}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.slice(startIndex, startIndex + PAGE_SIZE).map((row) => {
                            const original = row.original as LeadRowData;
                            const isOpen = !!expanded[original.session_id];
                            return (
                                <React.Fragment key={row.id}>
                                    <tr className="bg-navy">
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className={cellClass}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                    {isOpen && (
                                        <tr className="bg-navy">
                                            <td className="px-4 py-3 text-sm text-white/80" colSpan={row.getVisibleCells().length}>
                                                <div className="rounded-lg p-3 bg-navy">
                                                    <div className="mb-2 text-xs text-white/70">
                                                        <strong>Session ID:</strong> {original.session_id}
                                                    </div>
                                                    {historyLoading[original.session_id] && (
                                                        <div className="text-white/70">Loading history…</div>
                                                    )}
                                                    {!historyLoading[original.session_id] && historyError[original.session_id] && (
                                                        <div className="text-amber">{historyError[original.session_id]}</div>
                                                    )}
                                                    {!historyLoading[original.session_id] && !historyError[original.session_id] && (
                                                        <div className="flex flex-col space-y-2">
                                                            {(histories[original.session_id] || []).length === 0 && (
                                                                <div className="text-white/70">No history available.</div>
                                                            )}
                                                            {(histories[original.session_id] || []).map((msg, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={`max-w-[85%] px-3 py-[1%] rounded-lg ${msg.sender === 'You'
                                                                        ? 'bg-pacific self-end text-white font-semibold'
                                                                        : 'bg-sky self-start text-navy font-semibold'
                                                                        }`}
                                                                >
                                                                    {msg.text}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
                {pagedRows.map((r) => {
                    const isOpen = !!expanded[r.session_id];
                    return (
                        <div key={r.session_id} className="rounded-lg shadow-md p-4 bg-navy">
                            <div className="flex items-center justify-between">
                                <div className="text-white font-semibold">{r.name}</div>
                                <button
                                    type="button"
                                    className="text-sky"
                                    onClick={() => {
                                        setExpanded((e) => ({ ...e, [r.session_id]: !isOpen }));
                                        if (!isOpen && !histories[r.session_id] && !historyLoading[r.session_id]) {
                                            loadHistory(r.session_id);
                                        }
                                    }}
                                >
                                    {r.session_id ? `${r.session_id.slice(0, 5)}...` : ''}
                                </button>

                            </div>
                            <div className="mt-2 text-white/90 text-sm">
                                <div>email: {r.email}</div>
                                <div>country: {r.country}</div>
                                <div>mobile: {r.mobile_number}</div>
                                <div>domain: {r.domain}</div>
                                <div>time: {r.time}</div>
                            </div>
                            <div className="mt-3 flex items-center gap-3">
                                <div className={`w-40 ${statusColors[r.status]}`}>
                                    <Dropdown<LeadStatus>
                                        label={r.status}
                                        options={[
                                            { label: 'OPEN', value: 'OPEN' },
                                            { label: 'CLOSED', value: 'CLOSED' },
                                            { label: 'QUALIFYING', value: 'QUALIFYING' },
                                        ]}
                                        onSelect={(value) => onChangeStatus(r.session_id, value)}
                                    />
                                </div>
                                <DeleteButton
                                onClick={() => onToggleActive(r.session_id, false)}
                                />
                            </div>
                            <div className="mt-3">
                                <RowRemarks
                                    sessionId={r.session_id}
                                    initialRemarks={r.remarks ?? ''}
                                    saving={!!saving[r.session_id]}
                                    onSave={onSaveRemarks}
                                />
                            </div>
                            

                            {isOpen && (
                                <div className="mt-3 rounded-lg p-3 bg-navy">
                                    <div className="mb-2 text-xs text-white/70">
                                        <strong>Session ID:</strong> {r.session_id}
                                    </div>
                                    {historyLoading[r.session_id] && (
                                        <div className="text-white/70">Loading history…</div>
                                    )}
                                    {!historyLoading[r.session_id] && historyError[r.session_id] && (
                                        <div className="text-amber">{historyError[r.session_id]}</div>
                                    )}
                                    {!historyLoading[r.session_id] && !historyError[r.session_id] && (
                                        <div className="flex flex-col space-y-2">
                                            {(histories[r.session_id] || []).length === 0 && (
                                                <div className="text-white/70">No history available.</div>
                                            )}
                                            {(histories[r.session_id] || []).map((msg, i) => (
                                                <div
                                                    key={i}
                                                    className={`max-w-[85%] px-3 py-[1%] rounded-lg ${msg.sender === 'You'
                                                        ? 'bg-pacific self-end text-white font-semibold'
                                                        : 'bg-sky self-start text-navy font-semibold'
                                                        }`}
                                                >
                                                    {msg.text}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-between mt-4 text-white">
                <div className="text-sm">Page {currentPage} of {totalPages}</div>
                <div className="flex gap-2">
                    <button type="button"
                        className="px-3 py-2 rounded-md bg-tangerine text-white disabled:opacity-50"
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                    >
                        « First
                    </button>
                    <button type="button"
                        className="px-3 py-2 rounded-md bg-tangerine text-white disabled:opacity-50"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        ‹ Prev
                    </button>
                    <button type="button"
                        className="px-3 py-2 rounded-md bg-tangerine text-white disabled:opacity-50"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next ›
                    </button>
                    <button type="button"
                        className="px-3 py-2 rounded-md bg-tangerine text-white disabled:opacity-50"
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        Last »
                    </button>
                </div>
            </div>
        </section>
    );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            className="px-3 py-2 rounded-md bg-amber text-white disabled:opacity-60"
            onClick={onClick}
        >
            Delete
        </button>
    );
}


function RowRemarks({
    sessionId,
    initialRemarks,
    saving,
    onSave,
}: {
    sessionId: string;
    initialRemarks: string;
    saving: boolean;
    onSave: (session_id: string, remarks: string) => Promise<void>;
}) {
    const [value, setValue] = useState(initialRemarks);
    const [isEditing, setIsEditing] = useState(false);
    useEffect(() => setValue(initialRemarks), [initialRemarks]);
    
    return (
        <div className="flex items-start gap-2">
            {isEditing ? (
                <textarea
                    className="w-full px-3 py-2 rounded-lg bg-sky text-navy placeholder-navy/60"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Add remarks"
                    rows={PAGE_SIZE}
                />
            ) : (
                <div className="w-full min-h-[2.5rem] px-3 py-2 rounded-lg bg-sky text-navy whitespace-pre-wrap">
                    {value || 'Add remarks'}
                </div>
            )}
            {isEditing ? (
                <button
                    type="button"
                    className="px-3 py-2 rounded-md bg-amber text-white disabled:opacity-60"
                    onClick={async () => {
                        await onSave(sessionId, value);
                        setIsEditing(false);
                    }}
                    disabled={saving}
                >
                    {saving ? 'Saving…' : 'Save'}
                </button>
            ) : (
                <button
                    type="button"
                    aria-label="Edit remarks"
                    className="p-2 rounded-md bg-amber text-white hover:opacity-90"
                    onClick={() => setIsEditing(true)}
                >
                    ✎
                </button>
            )}
        </div>
    );
}
