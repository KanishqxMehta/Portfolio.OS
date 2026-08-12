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
    default: "Portfolio.OS | AI Resume to Portfolio Converter & Developer Builder",
    template: "%s | Portfolio.OS",
  },
  description: "Convert your PDF resume into a live, interactive developer portfolio website in seconds with AI. Free templates, ATS optimization, drag-and-drop editing, and instant publishing. Stand out to recruiters!",
  keywords: [
    "ai portfolio builder from resume",
    "resume to portfolio converter",
    "convert resume to portfolio website",
    "ai resume parser",
    "developer portfolio builder",
    "free developer portfolio",
    "resume to website converter",
    "ATS resume optimizer",
    "portfolioos"
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
    title: "Portfolio.OS | AI Resume to Portfolio Converter",
    description: "Convert your PDF resume into a live developer portfolio website in seconds with AI. Free templates, ATS optimization, and instant publishing.",
    type: "website",
    siteName: "Portfolio.OS",
    locale: "en_US",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio.OS | AI Resume to Portfolio Converter",
    description: "Convert your PDF resume into a live developer portfolio website in seconds with AI. Free templates, ATS optimization, and instant publishing.",
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

