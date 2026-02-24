// dashboard/useDashboard.tsx
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useLeads, LeadRowData, LeadStatus } from "./useLeads";
import Dropdown from "@/app/components/common/dropdown";

export function useDashboard(initialRows: LeadRowData[]) {
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
  const PAGE_SIZE = 6;
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedRows = rows.slice(startIndex, startIndex + PAGE_SIZE);

  const goToPage = (page: number) => {
    const clamped = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(clamped);
    setExpanded({});
  };

  const columns = useMemo<ColumnDef<LeadRowData>[]>(() => {
  const statusColors: Record<LeadStatus, string> = {
    OPEN: "text-pacific font-semibold",
    CLOSED: "text-tangerine font-semibold",
    QUALIFYING: "text-amber font-semibold",
  };
  return [
    {
      header: "Session Id",
      accessorKey: "session_id",
      cell: ({ row }) => {
        const r = row.original;
        const isOpen = !!expanded[r.session_id];
        return (
          <button
            type="button"
            className="hover:text-sky"
            onClick={() => {
              setExpanded((e) => ({ ...e, [r.session_id]: !isOpen }));
              if (!isOpen && !histories[r.session_id] && !historyLoading[r.session_id]) {
                loadHistory(r.session_id);
              }
            }}
          >
            {r.session_id ? `${r.session_id.slice(0, 5)}...` : ""}
          </button>
        );
      },
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => row.original.name,
    },
    {
      header: "Contact Details",
      id: "contact",
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
      header: "Status",
      id: "status",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className={`w-44 ${statusColors[r.status]}`}>
            <Dropdown<LeadStatus>
              label={r.status}
              options={[
                { label: "OPEN", value: "OPEN" },
                { label: "CLOSED", value: "CLOSED" },
                { label: "QUALIFYING", value: "QUALIFYING" },
              ]}
              onSelect={(value) => onChangeStatus(r.session_id, value)}
            />
          </div>
        );
      },
    },
  ];
  }, [expanded, histories, historyLoading, onChangeStatus, setExpanded, loadHistory]);

  const statusColors: Record<LeadStatus, string> = {
    OPEN: "text-pacific font-semibold",
    CLOSED: "text-tangerine font-semibold",
    QUALIFYING: "text-amber font-semibold",
  };

  return {
    rows,
    error,
    saving,
    expanded,
    setExpanded,
    onSaveRemarks,
    onToggleActive,
    histories,
    historyLoading,
    historyError,
    loadHistory,
    currentPage,
    totalPages,
    startIndex,
    pagedRows,
    goToPage,
    columns,
    statusColors,
  };
}
