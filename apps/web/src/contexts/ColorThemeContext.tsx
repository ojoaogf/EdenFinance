import { createContext, useContext, useEffect, useState } from "react";
import { useTheme as useNextTheme } from "next-themes";
import {
  COLOR_THEMES,
  DEFAULT_COLOR_THEME_ID,
} from "@/constants/color-themes";

const STORAGE_KEY = "eden-color-theme";

interface ColorThemeContextType {
  colorTheme: string;
  setColorTheme: (id: string) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(
  undefined,
);

const isValidThemeId = (id: string | null): id is string =>
  !!id && COLOR_THEMES.some((t) => t.id === id);

export function ColorThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setTheme: setNextTheme } = useNextTheme();
  const [colorTheme, setColorThemeState] = useState<string>(() => {
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
    return isValidThemeId(stored) ? stored : DEFAULT_COLOR_THEME_ID;
  });

  useEffect(() => {
    const definition =
      COLOR_THEMES.find((t) => t.id === colorTheme) ?? COLOR_THEMES[0];

    document.documentElement.setAttribute("data-color-theme", definition.id);
    // Mantém a classe "dark"/"light" do next-themes sincronizada, já que
    // alguns componentes ainda usam o variant dark: do Tailwind.
    setNextTheme(definition.isDark ? "dark" : "light");
    window.localStorage.setItem(STORAGE_KEY, definition.id);
  }, [colorTheme, setNextTheme]);

  const setColorTheme = (id: string) => {
    if (isValidThemeId(id)) {
      setColorThemeState(id);
    }
  };

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return context;
}
