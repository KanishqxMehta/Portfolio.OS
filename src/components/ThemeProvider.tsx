"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

const ThemeContext = createContext<{
  theme: Theme | string;
  setTheme: (theme: Theme | string) => void;
  resolvedTheme: "dark" | "light" | string;
}>({
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "dark",
});

// We provide the same hook API as next-themes
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  ...props
}: {
  children: React.ReactNode;
  defaultTheme?: Theme | string;
  [key: string]: any;
}) {
  const [theme, setThemeState] = useState<Theme | string>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light" | string>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let effectiveTheme = theme;

    if (theme === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      effectiveTheme = systemDark ? "dark" : "light";
    }

    setResolvedTheme(effectiveTheme);

    if (effectiveTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (mounted) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, mounted]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        const root = document.documentElement;
        if (mediaQuery.matches) {
          root.classList.add("dark");
          setResolvedTheme("dark");
        } else {
          root.classList.remove("dark");
          setResolvedTheme("light");
        }
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
