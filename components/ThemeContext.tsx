import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemTheme = useSystemColorScheme();
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    const loadTheme = async () => {
      const stored = await AsyncStorage.getItem("theme");
      if (
        stored &&
        (stored === "light" || stored === "dark" || stored === "system")
      ) {
        setThemeState(stored);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    await AsyncStorage.setItem("theme", newTheme);
  };

  const resolvedTheme = theme === "system" ? systemTheme ?? "light" : theme;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
