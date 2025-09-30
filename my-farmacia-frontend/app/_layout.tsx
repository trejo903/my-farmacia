import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Asset } from "expo-asset";

// Evita que el splash nativo se oculte solo
SplashScreen.preventAutoHideAsync().catch(() => {});

// Ajusta cuánto tiempo extra quieres mostrar el logo (ms)
const DELAY_MS = 5000;

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;

    (async () => {
      try {
        // (Opcional) precarga del logo que definiste en app.json
        await Asset.fromModule(
          require("../assets/images/logo_farmacia.jpg")
        ).downloadAsync();
      } catch {}
      // Mantiene el splash visible un tiempo controlado
      t = setTimeout(async () => {
        setReady(true);
        try { await SplashScreen.hideAsync(); } catch {}
      }, DELAY_MS);
    })();

    return () => { if (t) clearTimeout(t); };
  }, []);

  // Mientras no esté listo, retornamos null para mantener el splash nativo
  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
