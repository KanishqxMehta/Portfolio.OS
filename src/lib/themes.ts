export type ThemeConfig = {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  cssVars: {
    "--p-bg": string;
    "--p-bg-secondary": string;
    "--p-bg-card": string;
    "--p-fg": string;
    "--p-fg-muted": string;
    "--p-primary": string;
    "--p-border": string;
    "--p-font": string;
    "--p-radius": string;
    "--p-border-width": string;
    "--p-border-style": string;
    "--p-shadow": string;
    "--p-shadow-hover": string;
    "--p-blur": string;
    "--p-transform-hover": string;
    "--p-pill-bg": string;
    "--p-noise-opacity"?: string;
  };
};

export const THEMES: Record<string, ThemeConfig> = {
  classic: {
    id: "classic",
    name: "Classic Dark",
    description: "The original stealth aesthetic",
    previewColor: "#09090b",
    cssVars: {
      "--p-bg": "#09090b",
      "--p-bg-secondary": "#18181b",
      "--p-bg-card": "rgba(24, 24, 27, 0.5)",
      "--p-fg": "#f4f4f5",
      "--p-fg-muted": "#a1a1aa",
      "--p-primary": "#8b5cf6",
      "--p-border": "#27272a",
      "--p-font": "var(--font-geist-sans)",
      "--p-radius": "16px",
      "--p-border-width": "1px",
      "--p-border-style": "solid",
      "--p-shadow": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      "--p-shadow-hover": "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      "--p-blur": "0px",
      "--p-transform-hover": "translateY(-4px)",
      "--p-pill-bg": "rgba(24, 24, 27, 0.8)",
    },
  },
  light: {
    id: "light",
    name: "Minimal Light",
    description: "Clean, high-contrast, elegant",
    previewColor: "#ffffff",
    cssVars: {
      "--p-bg": "#ffffff",
      "--p-bg-secondary": "#f4f4f5",
      "--p-bg-card": "#ffffff",
      "--p-fg": "#09090b",
      "--p-fg-muted": "#52525b",
      "--p-primary": "#000000",
      "--p-border": "#e4e4e7",
      "--p-font": "var(--font-geist-sans)",
      "--p-radius": "16px",
      "--p-border-width": "1px",
      "--p-border-style": "solid",
      "--p-shadow": "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      "--p-shadow-hover": "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      "--p-blur": "0px",
      "--p-transform-hover": "translateY(-4px)",
      "--p-pill-bg": "#ffffff",
    },
  },
  neobrutalism: {
    id: "neobrutalism",
    name: "Neo-Brutalism",
    description: "Bold colors, stark borders, hard shadows",
    previewColor: "#ffb703",
    cssVars: {
      "--p-bg": "#f4f0ea",
      "--p-bg-secondary": "#ffffff",
      "--p-bg-card": "#ffffff",
      "--p-fg": "#000000",
      "--p-fg-muted": "#444444",
      "--p-primary": "#ff4757", 
      "--p-border": "#000000",
      "--p-font": "var(--font-geist-sans)",
      "--p-radius": "16px",
      "--p-border-width": "3px",
      "--p-border-style": "solid",
      "--p-shadow": "4px 4px 0px #000000",
      "--p-shadow-hover": "6px 6px 0px #000000",
      "--p-blur": "0px",
      "--p-transform-hover": "translate(-2px, -2px)",
      "--p-pill-bg": "#ffeb3b", 
    },
  },
  liquidglass: {
    id: "liquidglass",
    name: "Glassmorphism",
    description: "Frosted glass over beautiful pastel gradients",
    previewColor: "#e0c3fc",
    cssVars: {
      "--p-bg": "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
      "--p-bg-secondary": "rgba(255, 255, 255, 0.02)",
      "--p-bg-card": "rgba(255, 255, 255, 0.03)",
      "--p-fg": "#ffffff",
      "--p-fg-muted": "#a1a1aa",
      "--p-primary": "#ffffff",
      "--p-border": "rgba(255, 255, 255, 0.08)",
      "--p-font": "var(--font-geist-sans)",
      "--p-radius": "24px",
      "--p-border-width": "1px",
      "--p-border-style": "solid",
      "--p-shadow": "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
      "--p-shadow-hover": "0 12px 40px 0 rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.15)",
      "--p-blur": "16px",
      "--p-transform-hover": "translateY(-4px)",
      "--p-pill-bg": "rgba(255, 255, 255, 0.05)",
    },
  },
  terminal: {
    id: "terminal",
    name: "Terminal",
    description: "Phosphor-green hacker aesthetic",
    previewColor: "#22c55e",
    cssVars: {
      "--p-bg": "#000000",
      "--p-bg-secondary": "#0a0a0a",
      "--p-bg-card": "#000000",
      "--p-fg": "#22c55e",
      "--p-fg-muted": "#166534",
      "--p-primary": "#4ade80",
      "--p-border": "#22c55e",
      "--p-font": "var(--font-geist-mono)",
      "--p-radius": "0px",
      "--p-border-width": "1px",
      "--p-border-style": "dashed",
      "--p-shadow": "none",
      "--p-shadow-hover": "0 0 15px rgba(34, 197, 94, 0.3)",
      "--p-blur": "0px",
      "--p-transform-hover": "translateY(-2px)",
      "--p-pill-bg": "#000000",
    },
  },
  paper: {
    id: "paper",
    name: "Modern Ink",
    description: "Clean layout with subtle ink splashes",
    previewColor: "#0f172a",
    cssVars: {
      "--p-bg": "radial-gradient(circle at 10% 20%, rgba(15, 23, 42, 0.04) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(15, 23, 42, 0.05) 0%, transparent 50%), #fdfbf7",
      "--p-bg-secondary": "#ffffff",
      "--p-bg-card": "#ffffff",
      "--p-fg": "#0f172a",
      "--p-fg-muted": "#475569",
      "--p-primary": "#0f172a",
      "--p-border": "rgba(15, 23, 42, 0.1)",
      "--p-font": "var(--font-geist-sans)",
      "--p-radius": "24px",
      "--p-border-width": "1px",
      "--p-border-style": "solid",
      "--p-shadow": "0 20px 40px -10px rgba(0,0,0,0.05)",
      "--p-shadow-hover": "0 30px 60px -15px rgba(0,0,0,0.1)",
      "--p-blur": "0px",
      "--p-transform-hover": "translateY(-2px)",
      "--p-pill-bg": "rgba(15, 23, 42, 0.05)",
      "--p-noise-opacity": "0.03",
    },
  },
};
