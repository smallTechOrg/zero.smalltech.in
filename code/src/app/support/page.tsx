import type { Metadata } from "next";
import Home from "../page";

// Page-specific SEO metadata
export const metadata: Metadata = {
  // Renders as "AI Support Agent | Zer0" via the title template in layout.tsx
  title: "AI Support Agent",
  description:
    "Give your customers instant answers with Zer0's AI support agent. Reduce ticket volume and improve satisfaction automatically.",
  // Canonical prevents duplicate-content issues if this page is ever linked with query params
  alternates: { canonical: "/support" },
  openGraph: {
    title: "Zer0 AI Support Agent — Instant Customer Answers",
    description:
      "Reduce support tickets and delight customers with Zer0's always-on AI support agent.",
    url: "https://zero.smalltech.in/support",
  },
};
export default function SupportRoute() {
  return <Home initialPage="support" />;
}
