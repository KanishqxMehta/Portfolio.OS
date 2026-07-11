import { ImageResponse } from "next/og";
import { pool } from "@/lib/db";
import { THEMES } from "@/lib/themes";

export const runtime = "nodejs";

export const alt = "Portfolio Profile";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let name = slug;
  let bio = "View my professional developer portfolio.";
  let themeKey = "classic";

  try {
    const result = await pool.query(
      'SELECT content FROM "Portfolio" WHERE "publicSlug" = $1',
      [slug]
    );

    if (result.rows.length > 0) {
      const content = result.rows[0].content || {};
      const sections = content.sections || [];
      const hero = sections.find((s: any) => s.type === "HERO");
      
      if (hero?.content?.fullName) name = hero.content.fullName;
      if (hero?.content?.bio) bio = hero.content.bio;
      if (content.theme) themeKey = content.theme;
    }
  } catch (e) {
    console.error("OG Image generation DB error:", e);
  }

  const theme = THEMES[themeKey] || THEMES["classic"];
  const vars = theme.cssVars;

  // Extract CSS variables to Satori-compatible values
  const bg = vars["--p-bg"] || "#09090b";
  const fg = vars["--p-fg"] || "#f4f4f5";
  const primary = vars["--p-primary"] || "#8b5cf6";
  const border = vars["--p-border"] || "#27272a";
  const cardBg = vars["--p-bg-secondary"] || "#18181b";
  const isLight = themeKey === "light" || themeKey === "paper" || themeKey === "neobrutalism";

  // Bio truncation
  const shortBio = bio.length > 130 ? bio.substring(0, 127) + "..." : bio;
  const initial = name.charAt(0).toUpperCase();

  // Grid pattern for background (Satori supports SVG data URIs)
  const gridColor = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";
  const dotGrid = `url('data:image/svg+xml;utf8,<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg"><circle cx="2" cy="2" r="2" fill="${gridColor}"/></svg>')`;

  // Define layout styles based on theme
  const isBrutal = themeKey === "neobrutalism";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: bg,
          backgroundImage: isBrutal ? "none" : dotGrid,
          color: fg,
          fontFamily: "sans-serif",
          padding: isBrutal ? 40 : 0,
        }}
      >
        {isBrutal ? (
          // NEO-BRUTALISM LAYOUT
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              backgroundColor: cardBg,
              border: "6px solid #000",
              boxShadow: "16px 16px 0px #000",
              padding: 60,
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", backgroundColor: primary, color: "#000", border: "4px solid #000", padding: "10px 24px", fontWeight: 900, fontSize: 24, letterSpacing: "-0.05em", boxShadow: "4px 4px 0px #000" }}>
                  PORTFOLIO.OS
                </div>
                <div style={{ display: "flex", marginLeft: 24, fontSize: 28, fontWeight: 800, color: fg }}>
                  /p/{slug}
                </div>
              </div>
              <div style={{ display: "flex", width: 80, height: 80, borderRadius: 40, backgroundColor: primary, border: "4px solid #000", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 900, color: "#000", boxShadow: "4px 4px 0px #000" }}>
                {initial}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 110, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 24, color: "#000" }}>
                {name}
              </div>
              <div style={{ display: "flex", fontSize: 42, fontWeight: 600, color: "#000", opacity: 0.9, maxWidth: "90%", lineHeight: 1.3 }}>
                {shortBio}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", borderTop: "4px solid #000", paddingTop: 30, width: "100%", justifyContent: "space-between" }}>
              <div style={{ display: "flex", fontSize: 28, fontWeight: 800, color: "#000" }}>
                OPEN FOR OPPORTUNITIES
              </div>
              <div style={{ display: "flex", fontSize: 28, fontWeight: 800, backgroundColor: "#000", color: "#fff", padding: "8px 20px" }}>
                VIEW PROFILE ↗
              </div>
            </div>
          </div>
        ) : (
          // ELEGANT / DEFAULT LAYOUT (Classic, Light, Paper, etc.)
          <div style={{ display: "flex", width: "100%", height: "100%", position: "relative" }}>
            {/* Abstract Decorative Gradients (Satori fallback for blur is just using large faded shapes) */}
            <div style={{ position: "absolute", top: -150, right: -150, width: 600, height: 600, backgroundColor: primary, opacity: 0.15, borderRadius: 300 }} />
            <div style={{ position: "absolute", bottom: -200, left: -100, width: 500, height: 500, backgroundColor: primary, opacity: 0.1, borderRadius: 250 }} />
            
            <div style={{ display: "flex", flexDirection: "column", padding: 80, width: "100%", height: "100%", justifyContent: "space-between", zIndex: 10 }}>
              
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", backgroundColor: primary, color: isLight ? "#fff" : "#000", padding: "10px 24px", borderRadius: 999, fontWeight: 800, fontSize: 24, letterSpacing: "-0.02em" }}>
                    Portfolio.os
                  </div>
                  <div style={{ display: "flex", marginLeft: 20, fontSize: 26, opacity: 0.5, fontWeight: 500 }}>
                    portfolio.os/p/{slug}
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div style={{ display: "flex", flexDirection: "column", paddingLeft: 10 }}>
                <div style={{ display: "flex", fontSize: 110, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 30, color: fg }}>
                  {name}
                </div>
                <div style={{ display: "flex", fontSize: 42, opacity: 0.7, maxWidth: "85%", lineHeight: 1.3, fontWeight: 500, color: fg }}>
                  {shortBio}
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `2px solid ${border}`, paddingTop: 40, paddingLeft: 10 }}>
                <div style={{ display: "flex", fontSize: 30, fontWeight: 600, opacity: 0.5, color: fg, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Professional Portfolio
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", width: 70, height: 70, borderRadius: 35, backgroundColor: cardBg, border: `2px solid ${border}`, alignItems: "center", justifyContent: "center", color: primary, fontSize: 32, fontWeight: 800 }}>
                    {initial}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    ),
    {
      ...size,
    }
  );
}
