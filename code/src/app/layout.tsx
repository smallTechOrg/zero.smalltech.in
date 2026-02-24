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

export const metadata: Metadata = {
  title: "Zer0 — AI Agents for Small Businesses",
  description:
    "AI Agents for Small Businesses. Embeddable Smart Agent for your website.",
  openGraph: {
    title: "Zer0 — AI Agents for Small Businesses",
    description:
      "AI Agents for Small Businesses. Embeddable Smart Agent for your website.",
    url: "https://zero.smalltech.in",
    siteName: "Zer0",
    locale: "en_US",
    type: "website",
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
