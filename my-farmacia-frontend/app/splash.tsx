// app/splash.tsx
import React, { useEffect, useRef } from "react";
import { View, Image, StyleSheet, StatusBar, Animated, Easing, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Asset } from "expo-asset";

const DURATION_SHOW_MS = 5000; // 5s
const FADE_MS = 450;           // duración del fade in/out

export default function SplashScreen() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pre-carga del asset (evita blink en algunos dispositivos)
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        await Asset.fromModule(require("../assets/images/logo_farmacia.jpg")).downloadAsync();
      } catch {
        // mismo flujo aunque falle la precarga
      }
      if (!isMounted) return;

      // Fade in
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        // Mantén visible y luego dispara fade out + navegación
        timeoutRef.current = setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: FADE_MS,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }).start(() => {
            router.replace("/scan"); // ⬅️ ir a app/scan.tsx
          });
        }, Math.max(0, DURATION_SHOW_MS - FADE_MS));
      });
    })();

    return () => {
      isMounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      opacity.stopAnimation(); // evita animaciones colgantes
    };
  }, [opacity]);

  // Opción: permitir “tocar para continuar”
  const handleSkip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_MS,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      router.replace("/scan"); // ⬅️ ir a app/scan.tsx
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleSkip}
        accessibilityRole="button"
        accessibilityLabel="Saltar pantalla de introducción"
      >
        <Animated.View style={[styles.center, { opacity }]}>
          <Image
            source={require("../assets/images/logo_farmacia.jpg")}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Logo de MyFarmacia"
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  logo: {
    width: "70%",
    height: undefined,
    aspectRatio: 1, // ajusta si tu logo es rectangular (p.ej., 3/2 o 16/9)
  },
});
