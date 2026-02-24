/**
 * Google Analytics 4 — centralised tracking module.
 *
 * Every user-visible action is modelled as a typed event so nothing
 * can be tracked with a typo or missing metadata.  The module is a
 * no-op when GA has not loaded (SSR, ad-blockers, dev without a
 * measurement ID) — callers never need to guard.
 *
 * Usage:
 *   import { analytics } from '@/app/lib/analytics';
 *   analytics.track('cta_click', { cta_text: 'Sign Up', location: 'hero' });
 */

/* ================================================================== */
/*  GA Measurement ID                                                  */
/* ================================================================== */

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? 'G-L1SLDVPSX2';

/* ================================================================== */
/*  Low-level gtag helpers                                             */
/* ================================================================== */

type GtagCommand = 'config' | 'event' | 'set' | 'consent';

/** Safely call window.gtag — no-op when absent. */
function gtag(command: GtagCommand, ...args: unknown[]) {
  if (typeof window === 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (typeof w.gtag === 'function') {
    w.gtag(command, ...args);
  }
}

/* ================================================================== */
/*  Event taxonomy                                                     */
/* ================================================================== */

/**
 * Strongly-typed map of every custom event the app can fire.
 * Adding a new event here guarantees the caller passes the right
 * metadata — no stringly-typed surprises.
 */
export interface AnalyticsEventMap {
  /* ── Navigation ─────────────────────────────────────────────── */
  page_view: {
    page_title: string;
    page_path: string;
    page_referrer?: string;
  };
  spa_navigation: {
    from_page: string;
    to_page: string;
    to_industry?: string;
  };
  nav_click: {
    link_text: string;
    link_url?: string;
    location: 'header' | 'footer' | 'mobile_menu';
  };
  external_link_click: {
    link_text: string;
    link_url: string;
    location: string;
  };

  /* ── CTA / Engagement ────────────────────────────────────────── */
  cta_click: {
    cta_text: string;
    location: string;
    page: string;
    variant?: string;
  };
  chat_widget_opened: {
    trigger: 'cta' | 'fab' | 'auto' | 'parent_message';
    page: string;
    prefilled_message?: string;
  };

  /* ── Pricing ─────────────────────────────────────────────────── */
  pricing_billing_toggle: {
    billing_cycle: 'monthly' | 'yearly';
  };
  pricing_plan_click: {
    plan: 'free' | 'basic' | 'pro';
    billing_cycle: 'monthly' | 'yearly';
    price: string;
  };

  /* ── Sign-Up funnel ──────────────────────────────────────────── */
  signup_form_start: {
    first_field: string;
  };
  signup_field_interaction: {
    field_name: string;
    action: 'focus' | 'blur' | 'change';
    has_value: boolean;
  };
  signup_contact_method_change: {
    method: 'email' | 'phone';
  };
  signup_colour_change: {
    colour: string;
    source: 'preset' | 'picker' | 'text_input';
  };
  signup_form_submit: {
    website: string;
    contact_method: 'email' | 'phone';
    has_custom_prompt: boolean;
    colour: string;
  };
  signup_form_success: {
    website: string;
    session_id: string;
  };
  signup_form_error: {
    error_message: string;
    website: string;
  };
  signup_embed_code_copy: {
    website: string;
  };
  signup_start_over: Record<string, never>;

  /* ── Chat (main /chat page) ─────────────────────────────────── */
  chat_message_sent: {
    message_length: number;
    session_id: string;
    is_first_message: boolean;
    page: 'chat' | 'embed';
  };
  chat_message_received: {
    response_length: number;
    session_id: string;
    success: boolean;
    page: 'chat' | 'embed';
  };
  chat_error: {
    error_type: 'timeout' | 'network' | 'server' | 'unknown';
    session_id: string;
    page: 'chat' | 'embed';
  };
  chat_history_loaded: {
    message_count: number;
    session_id: string;
    page: 'chat' | 'embed';
  };

  /* ── Embed widget ────────────────────────────────────────────── */
  embed_widget_close: {
    session_id: string;
    message_count: number;
  };
  embed_widget_parent_message: {
    message_length: number;
  };

  /* ── Dashboard ───────────────────────────────────────────────── */
  dashboard_view: {
    total_leads: number;
    open_leads: number;
    qualifying_leads: number;
    closed_leads: number;
    domain_filter?: string;
  };
  dashboard_search: {
    query_length: number;
    result_count: number;
  };
  dashboard_status_filter: {
    status: 'ALL' | 'OPEN' | 'QUALIFYING' | 'CLOSED';
    result_count: number;
  };
  dashboard_lead_status_change: {
    session_id: string;
    from_status: string;
    to_status: string;
    domain?: string;
  };
  dashboard_lead_remarks_save: {
    session_id: string;
    remarks_length: number;
  };
  dashboard_lead_delete: {
    session_id: string;
    domain?: string;
  };
  dashboard_chat_history_view: {
    session_id: string;
    action: 'expand' | 'collapse';
  };
  dashboard_domain_link_copy: {
    domain: string;
  };
  dashboard_pagination: {
    page: number;
    total_pages: number;
    direction: 'first' | 'prev' | 'next' | 'last' | 'jump';
  };
  dashboard_sort: {
    column: string;
    direction: 'asc' | 'desc';
  };

  /* ── Infrastructure / UX quality ─────────────────────────────── */
  network_status_change: {
    status: 'online' | 'offline';
  };
  slow_loading_detected: {
    page: string;
  };
  js_error: {
    message: string;
    source?: string;
    lineno?: number;
    colno?: number;
  };
  api_latency: {
    endpoint: string;
    duration_ms: number;
    status: number;
    method: string;
  };
}

/* ================================================================== */
/*  Public analytics facade                                            */
/* ================================================================== */

export const analytics = {
  /**
   * Initialise GA config — call once in the root layout after the
   * gtag script has loaded.
   */
  init() {
    if (!GA_MEASUREMENT_ID) return;
    gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false, // we fire page_view manually for SPA
    });
  },

  /** Fire a strongly-typed custom event. */
  track<E extends keyof AnalyticsEventMap>(
    event: E,
    params: AnalyticsEventMap[E],
  ) {
    if (!GA_MEASUREMENT_ID) return;
    gtag('event', event, {
      ...params,
      // Attach timestamp for every event so BigQuery exports are
      // easy to correlate.
      event_timestamp: new Date().toISOString(),
    });
  },

  /** Convenience wrapper for SPA virtual page-views. */
  pageView(path: string, title: string) {
    if (!GA_MEASUREMENT_ID) return;
    gtag('event', 'page_view', {
      page_title: title,
      page_location: typeof window !== 'undefined' ? window.location.href : '',
      page_path: path,
    });
  },

  /** Set persistent user-scoped properties (e.g. after signup). */
  setUserProperties(props: Record<string, string | number | boolean>) {
    if (!GA_MEASUREMENT_ID) return;
    gtag('set', 'user_properties', props);
  },

  /** Measure a timed operation (e.g. API call). */
  timing(name: string, durationMs: number, meta?: Record<string, unknown>) {
    if (!GA_MEASUREMENT_ID) return;
    gtag('event', 'timing_complete', {
      name,
      value: Math.round(durationMs),
      ...meta,
    });
  },
};
