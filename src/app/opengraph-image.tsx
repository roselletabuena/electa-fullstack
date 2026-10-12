import { ImageResponse } from "next/og";

export const alt = "Electa — Trending Events | Official Event Voting Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#090D16",
        padding: "60px 80px",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* Top Accent Sky Border */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "8px",
          backgroundColor: "#0284C7",
        }}
      />

      {/* Brand Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {/* Logo emblem */}
        <div
          style={{
            width: "48px",
            height: "48px",
            backgroundColor: "#0284C7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: "28px",
            color: "#FFFFFF",
          }}
        >
          E
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: "32px",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#FFFFFF",
              lineHeight: 1,
            }}
          >
            ELECTA
          </span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: "#38BDF8",
              marginTop: "4px",
              textTransform: "uppercase",
            }}
          >
            VOTE · ENGAGE · CELEBRATE
          </span>
        </div>
      </div>

      {/* Central Hero Statement */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            display: "flex",
            fontSize: "64px",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: "#FFFFFF",
            lineHeight: 1.1,
            textTransform: "uppercase",
          }}
        >
          <span>SUPPORT YOUR </span>
          <span style={{ color: "#38BDF8", marginLeft: "14px" }}>EVENT CANDIDATES</span>
        </div>

        <p
          style={{
            fontSize: "24px",
            color: "#94A3B8",
            lineHeight: 1.4,
            maxWidth: "960px",
            margin: 0,
          }}
        >
          The official digital voting platform. Discover active events, explore contestant profiles,
          and cast verified free and boost votes.
        </p>
      </div>

      {/* Bottom Feature Capabilities Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #1E293B",
          paddingTop: "24px",
          color: "#64748B",
          fontSize: "16px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        <span>Bot & Abuse Protected</span>
        <span>•</span>
        <span>Live Stage Tallies</span>
        <span>•</span>
        <span>GCash & Maya Ready</span>
        <span>•</span>
        <span style={{ color: "#38BDF8" }}>Official Voting Platform</span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
