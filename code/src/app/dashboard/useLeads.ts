'use client';

import { useCallback, useEffect, useState } from 'react';
import { HistoryItem, LeadRowData, Message } from '../models/leads';
import { analytics } from '@/app/lib/analytics';

export type LeadStatus = 'OPEN' | 'CLOSED' | 'QUALIFYING';


// Makes a PATCH request to update lead status or remarks or is_active
async function patchLeadAPI(
  update: Partial<Pick<LeadRowData, 'status' | 'remarks' | 'is_active'>> & { session_id: string }
) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat-info`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || 'Update failed');
  }
  return res.json();
}

// Hook to manage lead data, status updates, remarks, and chat history

export function useLeads(initial: LeadRowData[] = []) {
  const [rows, setRows] = useState<LeadRowData[]>(initial);
  // keep rows in sync when initial changes (e.g., after parent fetch completes)
  useEffect(() => {
    setRows(initial || []);
  }, [initial]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [histories, setHistories] = useState<Record<string, Message[]>>({});
  const [historyLoading, setHistoryLoading] = useState<Record<string, boolean>>({});
  const [historyError, setHistoryError] = useState<Record<string, string | undefined>>({});

  const patchLead = async (
    update: Partial<Pick<LeadRowData, 'status' | 'remarks' | 'is_active'>> & { session_id: string }
  ) => {
    return patchLeadAPI(update);
  };

//  Updates the status of a lead row (OPEN / CLOSED / QUALIFYING)

  const onChangeStatus = useCallback(async (session_id: string, status: LeadStatus) => {
    const prevRow = rows.find(r => r.session_id === session_id);
    analytics.track('dashboard_lead_status_change', {
      session_id,
      from_status: prevRow?.status ?? 'unknown',
      to_status: status,
      domain: prevRow?.domain,
    });
    setRows((prev) => prev.map((r) => (r.session_id === session_id ? { ...r, status } : r)));
    setSaving((s) => ({ ...s, [session_id]: true }));
    try {
      await patchLead({ session_id, status });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving((s) => ({ ...s, [session_id]: false }));
    }
  }, [rows]);

  // Saves updated remarks for a session

  const onSaveRemarks = useCallback(async (session_id: string, remarks: string) => {
    analytics.track('dashboard_lead_remarks_save', {
      session_id,
      remarks_length: remarks.length,
    });
    setSaving((s) => ({ ...s, [session_id]: true }));
    try {
      await patchLead({ session_id, remarks });
      setRows((prev) =>
        prev.map((r) => (r.session_id === session_id ? { ...r, remarks } : r))
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving((s) => ({ ...s, [session_id]: false }));
    }
  }, []);

  // Sets is_active to false (soft delete) and removes from UI
  const onToggleActive = useCallback(async (session_id: string, is_active: boolean) => {
    setSaving((s) => ({ ...s, [session_id]: true }));
    try {
      await patchLead({ session_id, is_active });
      // Remove from UI since backend won't return it anymore
      setRows((prev) => prev.filter((r) => r.session_id !== session_id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving((s) => ({ ...s, [session_id]: false }));
    }
  }, []);

  // Loads chat history for a given session

  const loadHistory = useCallback(async (session_id: string) => {
    if (historyLoading[session_id]) return;
    setHistoryLoading((m) => ({ ...m, [session_id]: true }));
    setHistoryError((m) => ({ ...m, [session_id]: undefined }));
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/history?session_id=${encodeURIComponent(session_id)}`;
      const res = await fetch(url, { method: 'GET' });
      const data = await res.json();
      if (res.ok) {
        const msgs: Message[] = (data.history as HistoryItem[] | undefined)?.map((h) => ({
          sender: h.type === 'human' ? 'You' : 'Bot',
          text: h.content,
        })) || [];
        setHistories((m) => ({ ...m, [session_id]: msgs }));
      } else {
        const err = (data && (data.error || data.message)) || 'Failed to load history';
        setHistoryError((m) => ({ ...m, [session_id]: String(err) }));
      }
    } catch (e) {
      setHistoryError((m) => ({ ...m, [session_id]: (e as Error).message }));
    } finally {
      setHistoryLoading((m) => ({ ...m, [session_id]: false }));
    }
  }, [historyLoading]);

  return {
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
  };
}

// Hook to fetch leads from API (used once during initialization)
export function useFetchLeads() {
  // State to store the fetched leads
  const [rows, setRows] = useState<LeadRowData[]>([]);

  useEffect(() => {
    // Flag to prevent setting state after the component is unmounted
    let isCancelled = false;

    // Async function to fetch data
    const fetchLeads = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat-info`);
        if (!res.ok) return;
        const data = await res.json();

        // Only update state if component is still mounted
        if (!isCancelled) {
          const leads = Array.isArray(data) ? data : data?.leads ?? [];
          setRows(leads as LeadRowData[]);
        }
      } catch {
        console.log("error occurred");
      }
    };

    // Call the fetch function on mount
    fetchLeads();

    // Cleanup: this flag prevents setting state on an unmounted component
    return () => {
      isCancelled = true;
    };
  }, []);

  // Return fetched leads
  return { rows };
}

export type { LeadRowData };
