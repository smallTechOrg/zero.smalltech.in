// layout.tsx exists as a server component solely to own the `metadata` export.
// page.tsx uses "use client" (for useSearchParams), and Next.js does not allow
// exporting `metadata` from client components — it would throw a build error.
// Splitting into layout (server) + page (client) is the standard Next.js pattern.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Industry Solutions",
  description:
    "Zer0 AI agents built for your industry — e-commerce, healthcare, real estate, education, and more. Embed a 24/7 AI agent in minutes, no code required.",
  alternates: { canonical: "/industry" },
  openGraph: {
    title: "Industry Solutions",
    description:
        "Zer0 AI agents built for your industry — e-commerce, healthcare, real estate, education, and more. Embed a 24/7 AI agent in minutes, no code required.",
   url: "https://zero.smalltech.in/industry",
  },
};

export default function IndustryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
