import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import CursorScatter from "@/components/ui/CursorAnimations/CursorScatter";
import SmoothCursor from "@/components/ui/CursorAnimations/SmoothCursor";
import SmoothScroll from "@/components/ui/Scroll/SmoothScroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio.os — Build your developer portfolio",
  description: "Transform your experience into a stunning single-page portfolio. Block by block.",
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
            </SmoothScroll>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

