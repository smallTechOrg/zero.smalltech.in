import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import NetworkStatusBanner from "./components/common/networkStatus";
import Script from "next/script";

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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-L1SLDVPSX2"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-L1SLDVPSX2');
          `}
        </Script>
      </head>
      <body
        className={`${outfit.variable} antialiased min-h-screen flex flex-col`}
      >
        <NetworkStatusBanner />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
