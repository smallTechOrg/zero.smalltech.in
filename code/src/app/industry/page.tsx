// "use client" is required here because useSearchParams is a client-only hook.
// This means we cannot export `metadata` from this file — Next.js forbids metadata
// exports in client components. SEO metadata lives in layout.tsx instead.
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Home from "../page";

type IndustryKey =
  | "E-Commerce"
  | "Customer Service"
  | "Education"
  | "Enterprises"
  | "Healthcare"
  | "Insurance"
  | "IT Support"
  | "Real Estate"
  | "Recruitment"
  | "Sales"
  | "Small Business";

// Reads the ?industry= query param and renders the main Home page
// pre-scrolled to the industry section with the matching industry selected.
function IndustryRouteInner() {
  const params = useSearchParams();
  const industry = (params.get("industry") ?? "Small Business") as IndustryKey;
  return <Home initialPage="industry" initialIndustry={industry} />;
}

// Wrapped in Suspense because useSearchParams requires it in Next.js static export.
export default function IndustryRoute() {
  return (
    <Suspense fallback={null}>
      <IndustryRouteInner />
    </Suspense>
  );
}
