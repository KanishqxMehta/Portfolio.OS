import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import CursorScatter from "@/components/ui/CursorAnimations/CursorScatter";
import SmoothCursor from "@/components/ui/CursorAnimations/SmoothCursor";
import SmoothScroll from "@/components/ui/Scroll/SmoothScroll";

import { Toaster } from "@/components/ui/Toaster";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Portfolio.OS | Free AI Portfolio Maker & Resume to Portfolio Converter",
    template: "%s | Portfolio.OS",
  },
  description: "The #1 free AI portfolio maker for developers. Convert your PDF resume into an interactive developer portfolio website in seconds with AI, 6+ developer themes, ATS optimization, and instant publishing.",
  keywords: [
    "free portfolio maker",
    "ai portfolio maker",
    "resume to portfolio converter",
    "free developer portfolio maker",
    "convert resume to portfolio website",
    "ai resume to portfolio",
    "developer portfolio builder",
    "free portfolio website for developers",
    "software engineer portfolio generator",
    "ATS resume optimizer",
    "portfolioos",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://portfolioos.dev"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Portfolio.OS | Free AI Portfolio Maker & Resume to Portfolio Converter",
    description: "The #1 free AI portfolio maker for developers. Convert your PDF resume into an interactive developer portfolio website in seconds with AI, 6+ developer themes, and instant publishing.",
    type: "website",
    siteName: "Portfolio.OS",
    locale: "en_US",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio.OS | Free AI Portfolio Maker & Resume to Portfolio Converter",
    description: "The #1 free AI portfolio maker for developers. Convert your PDF resume into an interactive developer portfolio website in seconds with AI, 6+ developer themes, and instant publishing.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SessionProvider>
            <SmoothScroll>
              <CursorScatter />
              {children}
              <SmoothCursor />
              <Toaster />
              <Analytics />
              <SpeedInsights />
            </SmoothScroll>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

