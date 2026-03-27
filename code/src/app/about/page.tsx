import type { Metadata } from "next";
import Home from "../homePage";

// Page-specific SEO metadata — overrides the defaults set in layout.tsx.
export const metadata: Metadata = {
  // Renders as "About Us | Zer0" via the title template in layout.tsx
  title: "About Us",
  description:
    "Learn about SmallTech and our mission to give small businesses the same AI superpowers that enterprises use — simply and affordably.",
  // Canonical prevents duplicate-content issues if this page is ever linked with query params
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Zer0 — Built by SmallTech",
    description:
      "SmallTech's mission is to give small businesses the same AI superpowers that enterprises use.",
    url: "https://zero.smalltech.in/about",
  },
};

export default function AboutRoute() {
  return <Home initialPage="about" />;
}
