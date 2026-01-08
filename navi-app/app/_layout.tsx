import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";

// Prevent the splash screen from auto-hiding until fonts load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "ADLaMDisplay": require("../assets/fonts/ADLaMDisplay.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter.ttf"),
    "Lexend-Regular": require("../assets/fonts/Lexend.ttf"),
    "SpaceMono-Regular": require("../assets/fonts/SpaceMono.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* This automatically finds the (tabs) folder and its layout */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}