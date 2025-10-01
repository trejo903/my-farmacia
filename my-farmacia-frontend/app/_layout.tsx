import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Asset } from "expo-asset";

SplashScreen.preventAutoHideAsync().catch(() => {});

const DELAY_MS = 5000;

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;
    (async () => {
      try {
        // Asegúrate que el archivo sea PNG (coincide con app.json)
        await Asset.fromModule(require("../assets/images/logo_farmacia.png")).downloadAsync();
      } catch {}
      t = setTimeout(async () => {
        setReady(true);
        try { await SplashScreen.hideAsync(); } catch {}
      }, DELAY_MS);
    })();
    return () => { if (t) clearTimeout(t); };
  }, []);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="scan" />
      <Stack.Screen name="detalle" />
    </Stack>
  );
}
