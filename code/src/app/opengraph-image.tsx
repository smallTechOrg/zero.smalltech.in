// opengraph-image.tsx — generates a static OG/Twitter card image at build time.
// Next.js static export runs ImageResponse during `next build` and outputs
// a PNG to code/out/opengraph-image.png, served at https://zero.smalltech.in/opengraph-image.png
// Referenced automatically by Next.js via the metadata in layout.tsx.
// No `runtime = 'edge'` — that's incompatible with static export.

import { ImageResponse } from "next/og";

export const alt = "Zer0 — AI Agents for Small Businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a1628 0%, #219EBC 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "80px",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              background: "rgba(255,255,255,0.15)",
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          >
            <span style={{ color: "white", fontSize: "40px", fontWeight: "900" }}>
              Z
            </span>
          </div>
          <span style={{ color: "white", fontSize: "52px", fontWeight: "800" }}>
            Zer0
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            color: "white",
            fontSize: "68px",
            fontWeight: "900",
            textAlign: "center",
            margin: "0 0 24px",
            lineHeight: 1.1,
          }}
        >
          AI Agents for
          <br />
          Small Businesses
        </h1>

        {/* Tagline */}
        <p
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "28px",
            textAlign: "center",
            margin: "0 0 48px",
          }}
        >
          Embeddable · No Code · 24/7 Support
        </p>

        {/* Pills */}
        <div style={{ display: "flex", gap: "16px" }}>
          {["Sales Automation", "Lead Capture", "Customer Support"].map((label) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "100px",
                padding: "10px 24px",
                color: "white",
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
