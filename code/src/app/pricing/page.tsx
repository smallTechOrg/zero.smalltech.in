import type { Metadata } from "next";
import Home from "../page";

// Page-specific SEO metadata 
export const metadata: Metadata = {
  // Renders as "Pricing | Zer0" via the title template in layout.tsx
  title: "Pricing",
  description:
    "Simple, transparent pricing for Zer0 AI agents. Start free and scale as you grow. No hidden fees.",
  // Canonical prevents duplicate-content issues if this page is ever linked with query params
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Zer0 Pricing — Plans for Every Small Business",
    description:
      "Simple, transparent pricing for Zer0 AI agents. Start free and scale as you grow.",
    url: "https://zero.smalltech.in/pricing",
  },
};

export default function PricingRoute() {
  return <Home initialPage="pricing" />;
}
