import type { Metadata } from "next";
import Home from "../page";

// Page-specific SEO metadata
export const metadata: Metadata = {
  // Renders as "Sign Up | Zer0" via the title template in layout.tsx
  title: "Sign Up",
  description:
    "Create your free Zer0 account and deploy an AI agent on your website in minutes.",
  alternates: { canonical: "/signup" },
 openGraph: {
    title: "Sign Up - Zer0 AI Sales Agent",
    description:
      "Create your free Zer0 account and deploy an AI agent on your website in minutes.",
    url: "https://zero.smalltech.in/signup",
  },
};

export default function SignUpRoute() {
  return <Home initialPage="signup" />;
}
