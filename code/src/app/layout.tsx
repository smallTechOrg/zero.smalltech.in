import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import NetworkStatusBanner from "./components/common/networkStatus";
import Script from "next/script";
import { GA_MEASUREMENT_ID } from "./lib/analytics";
import { AnalyticsProvider } from "./lib/analyticsProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

// SEO metadata applied to every page as defaults.
// Individual route pages (e.g. /pricing/page.tsx) can override any of these
export const metadata: Metadata = {
  // Required base URL so Next.js can resolve relative canonical/OG URLs correctly.
  // Without this, alternates.canonical "/" would render as a bare "/" instead of
  // the full "https://zero.smalltech.in/" in the <head>.
  metadataBase: new URL("https://zero.smalltech.in"),

  title: {
    // Fallback title used when a page doesn't export its own metadata.title
    default: "Zer0 — AI Agents for Small Businesses",
    // Template applied to all child page titles: e.g. "Pricing" → "Pricing | Zer0"
    template: "%s | Zer0",
  },

  description:
    "Zer0 by SmallTech gives small businesses an embeddable AI agent that handles sales, support, and lead capture — 24/7, no code required.",

  // Keywords hint for crawlers (low ranking signal but still used by some engines)
  keywords: [
    "AI sales agent for small business",
    "embeddable chatbot",
    "AI sales agent",
    "AI customer support",
    "lead capture AI",
    "website chatbot",
    "no-code AI agent",
    "small business automation",
    "AI chatbot for websites",
    "AI chat agent for websiites",
    "AI chatbot for real estate",
    "AI chatbot for ecommerce websites"
  ],

  // Explicitly tell crawlers to index and follow links on all pages.
  // Individual pages (e.g. /signup) can set { index: false } to override.
  robots: { index: true, follow: true },

  // Canonical URL for the homepage — prevents duplicate-content penalties
  // if the site is ever accessible via multiple URLs (www vs non-www, etc.)
  alternates: { canonical: "/" },

  // Favicon — SVG favicon (app/icon.svg is also picked up automatically by Next.js)
  icons: {
    icon: { url: "/logo.svg", type: "image/svg+xml" },
  },

  // Open Graph tags — used by Facebook, LinkedIn, Slack, etc. for link previews
  openGraph: {
    title: "Zer0 — AI Agents for Small Businesses",
    description:
      "Zer0 by SmallTech gives small businesses an embeddable AI agent that handles sales, support, and lead capture — 24/7, no code required.",
    url: "https://zero.smalltech.in",
    siteName: "Zer0",
    locale: "en_US",
    type: "website",
    // opengraph-image.tsx in app/ generates this PNG automatically at build time
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Zer0 — AI Agents for Small Businesses" }],
  },

  // Twitter card — controls how links appear when shared on X/Twitter
  // "summary_large_image" shows a large banner; image comes from opengraph-image.tsx
  twitter: {
    card: "summary_large_image",
    title: "Zer0 — AI Agents for Small Businesses",
    description:
      "Embeddable AI agents for small businesses. Handle sales, support, and leads automatically.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* JSON-LD structured data — helps Google understand what Zer0 is.
    SoftwareApplication schema is the correct type for a SaaS product.
    Validated at: https://search.google.com/test/rich-results */}
        <script
          type="application/ld+json" // Tells the browser/crawler this script contains JSON-LD data
          dangerouslySetInnerHTML={{
            // React specific attribute to inject raw strings as HTML (required for script tags)
            __html: JSON.stringify({
              "@context": "https://schema.org", // Defines the vocabulary (dictionary) being used
              "@type": "SoftwareApplication",   // Tells Google this page represents a software/SaaS product
              name: "Zer0",                     // The official name of the software
              applicationCategory: "BusinessApplication", // Categorizes it for app stores/search rankings
              description:
                "Embeddable AI agent for small businesses that handles sales, support, and lead capture — 24/7, no code required.", // High-level product summary
              operatingSystem: "Web Browser",   // Specifies this is a SaaS/Web app, not a Windows/Mac exe
              url: "https://zero.smalltech.in", // The primary link to the software
              offers: {
                "@type": "Offer",               // Begins the pricing/licensing information
                price: "0",                     // The numerical starting price
                priceCurrency: "USD",           // The currency for the price above
                description: "Free plan with 200 conversations/month", // Details of the price level
              },
              author: {
                "@type": "Organization",        // Links the software to a legal company/entity
                name: "SmallTech",              // Name of the parent company
                url: "https://smalltech.in",     // Website of the parent company
                logo: "https://zero.smalltech.in/logo.svg", // Brand identity for the Knowledge Graph card
                contactPoint: {
                  "@type": "ContactPoint",      // Defines how customers can reach the company
                  email: "zero@smalltech.in",   // Support email address
                  contactType: "customer support", // Labels the purpose of this email
                },
              },
            }),
          }}
        />
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  send_page_view: false,
                  cookie_flags: 'SameSite=None;Secure',
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${outfit.variable} antialiased min-h-screen flex flex-col`}
      >
        <AnalyticsProvider />
        <NetworkStatusBanner />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
