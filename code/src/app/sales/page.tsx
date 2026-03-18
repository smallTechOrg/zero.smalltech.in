import type { Metadata } from "next";
import Home from "../page";

// Page-specific SEO metadata
export const metadata: Metadata = {
  // Renders as "AI Sales Agent | Zer0" via the title template in layout.tsx
  title: "AI Sales Agent",
  description:
    "Automate your sales pipeline with Zer0's AI sales agent. Qualify leads, book demos, and close deals — 24/7.",
  // Canonical prevents duplicate-content issues if this page is ever linked with query params
  alternates: { canonical: "/sales" },
  openGraph: {
    title: "Zer0 AI Sales Agent — Automate Your Pipeline",
    description:
      "Qualify leads, book demos, and close deals automatically with Zer0's embeddable AI sales agent.",
    url: "https://zero.smalltech.in/sales",
  },
};


export default function SalesRoute() {
  return <Home initialPage="sales" />;
}
