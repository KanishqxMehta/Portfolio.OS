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
    default: "Portfolio.os — Build your developer portfolio",
    template: "%s | Portfolio.os",
  },
  description: "Transform your experience into a stunning single-page developer portfolio. Block by block, instantly.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  keywords: ["portfolio", "developer portfolio", "resume builder", "portfolio builder", "resume-to-portfolio"],
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
    title: "Portfolio.os — Build your developer portfolio",
    description: "Transform your experience into a stunning single-page developer portfolio. Block by block, instantly.",
    type: "website",
    siteName: "Portfolio.os",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio.os — Build your developer portfolio",
    description: "Transform your experience into a stunning single-page developer portfolio. Block by block, instantly.",
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

