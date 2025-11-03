import { useTheme } from "./ThemeContext";

export const useColorScheme = () => {
  const { resolvedTheme } = useTheme();
  return resolvedTheme;
};
