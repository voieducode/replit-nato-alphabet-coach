import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "rainbow" | "nato" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: "light" | "dark" | "rainbow" | "nato"; // The resolved theme (system becomes light/dark)
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("system");
  const [actualTheme, setActualTheme] = useState<
    "light" | "dark" | "rainbow" | "nato"
  >("light");

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme;
    if (
      stored &&
      ["light", "dark", "rainbow", "nato", "system"].includes(stored)
    ) {
      setTheme(stored);
    }
  }, []);

  // Save theme to localStorage when changed
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Handle system theme detection and apply themes
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (currentTheme: Theme) => {
      // Remove all theme classes
      root.classList.remove("light", "dark", "rainbow", "nato");

      let resolvedTheme: "light" | "dark" | "rainbow" | "nato";

      if (currentTheme === "system") {
        resolvedTheme = mediaQuery.matches ? "dark" : "light";
      } else {
        resolvedTheme = currentTheme;
      }

      root.classList.add(resolvedTheme);
      setActualTheme(resolvedTheme);
    };

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        applyTheme(theme);
      }
    };

    applyTheme(theme);
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
