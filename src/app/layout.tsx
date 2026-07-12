import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import CursorScatter from "@/components/ui/CursorAnimations/CursorScatter";
import SmoothCursor from "@/components/ui/CursorAnimations/SmoothCursor";
import SmoothScroll from "@/components/ui/Scroll/SmoothScroll";

import { Toaster } from "@/components/ui/Toaster";

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
    default: "Portfolio.OS — Free Portfolio Builder for Developers | Create Your Portfolio",
    template: "%s | Portfolio.OS",
  },
  description: "Build a stunning developer portfolio in minutes — no code needed. Portfolio.OS is a free portfolio making website with beautiful themes, drag-and-drop editing, and instant publishing.",
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
    title: "Portfolio.OS — Free Portfolio Builder for Developers",
    description: "Build a stunning developer portfolio in minutes — no code needed. Beautiful themes, drag-and-drop editing, and instant publishing.",
    type: "website",
    siteName: "Portfolio.OS",
    locale: "en_US",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio.OS — Free Portfolio Builder for Developers",
    description: "Build a stunning developer portfolio in minutes — no code needed. Beautiful themes, drag-and-drop editing, and instant publishing.",
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
            </SmoothScroll>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

