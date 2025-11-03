import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import AnimatedSplashScreen from "@/components/SplashScreen";
import { ThemeProvider } from "@/components/ThemeContext";
import { useColorScheme } from "@/components/useColorScheme";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && animationComplete) {
      SplashScreen.hideAsync();
    }
  }, [loaded, animationComplete]);

  if (!loaded || !animationComplete) {
    return (
      <AnimatedSplashScreen
        onAnimationComplete={() => setAnimationComplete(true)}
      />
    );
  }

  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <NavigationThemeProvider
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="privacy"
          options={{ presentation: "modal", headerShown: false }}
        />
      </Stack>
    </NavigationThemeProvider>
  );
}
