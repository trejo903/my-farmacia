import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Alert, Pressable, Linking } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as ExpoLinking from "expo-linking";

/** === Seguridad y validación === */
const SCAN_MAX_LEN = 512;                    // Máximo tamaño aceptado
const ID_REGEX = /^[A-Za-z0-9\-_:]{4,64}$/;  // Ajusta a tu formato
const APP_SCHEME = "myfarmaciafrontend";     // También definido en app.json

function sanitize(raw: string) {
  return raw.replace(/[\u0000-\u001F\u007F\uFEFF]/g, "").trim();
}
function isHttpsUrl(s: string): URL | null {
  try {
    const u = new URL(s);
    return u.protocol === "https:" ? u : null;
  } catch {
    return null;
  }
}
function isDeepLink(s: string) {
  return s.startsWith(`${APP_SCHEME}://`);
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const requestingRef = useRef(false);
  const router = useRouter();

  // Pedir permiso si aún se puede
  useEffect(() => {
    if (!permission) return;
    if (permission.granted) return;
    if (!permission.canAskAgain) return;
    if (requestingRef.current) return;
    requestingRef.current = true;
    requestPermission().finally(() => {
      setTimeout(() => (requestingRef.current = false), 300);
    });
  }, [permission, requestPermission]);

  // Reset al volver a enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      setScanned(false);
      return () => {};
    }, [])
  );

  const handleBarcode = useCallback(
    async ({ data, type }: { data: string; type: string }) => {
      if (scanned) return;
      setScanned(true);
      try { await Haptics.selectionAsync(); } catch {}

      const value = sanitize(String(data));
      if (!value || value.length > SCAN_MAX_LEN) {
        Alert.alert("QR inválido", "El contenido del código no es válido.", [
          { text: "OK", onPress: () => setScanned(false) }
        ]);
        return;
      }

      // 1) Deep link interno: myfarmaciafrontend://detalle?id=XYZ
      if (isDeepLink(value)) {
        const parsed = ExpoLinking.parse(value);
        const path = (parsed?.path ?? "").replace(/^\/+/, ""); // "detalle"
        if (path === "detalle") {
          const id = String(parsed?.queryParams?.id ?? "");
          if (!ID_REGEX.test(id)) {
            Alert.alert("ID inválido", "El enlace interno no contiene un ID válido.", [
              { text: "OK", onPress: () => setScanned(false) }
            ]);
            return;
          }
          router.push({ pathname: "/detalle", params: { id, kind: type } });
          return;
        }
        Alert.alert("Enlace interno desconocido", value, [
          { text: "OK", onPress: () => setScanned(false) }
        ]);
        return;
      }

      // 2) URL HTTPS → confirmar y abrir (sin lista blanca)
      const url = isHttpsUrl(value);
      if (url) {
        const pretty = url.toString();
        Alert.alert("Abrir enlace", pretty, [
          { text: "Cancelar", style: "cancel", onPress: () => setScanned(false) },
          {
            text: "Abrir",
            onPress: async () => {
              try { await Linking.openURL(pretty); }
              catch {
                Alert.alert("Error", "No se pudo abrir el enlace.", [
                  { text: "OK", onPress: () => setScanned(false) }
                ]);
              }
            }
          }
        ]);
        return;
      }

      // 3) ID opaco → navegar a detalle y consultar backend
      if (ID_REGEX.test(value)) {
        router.push({ pathname: "/detalle", params: { id: value, kind: type } });
        return;
      }

      // 4) Caso no reconocido
      Alert.alert("Código no compatible", "Este QR no coincide con los formatos soportados.", [
        { text: "OK", onPress: () => setScanned(false) }
      ]);
    },
    [scanned, router]
  );

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Cargando permiso…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 12, textAlign: "center" }}>
          Se requiere permiso de cámara para escanear.
        </Text>
        {permission.canAskAgain ? (
          <Pressable style={styles.btn} onPress={requestPermission}>
            <Text style={styles.btnText}>Conceder permiso</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.btn}
            onPress={() => Linking.openSettings().catch(() => {})}
          >
            <Text style={styles.btnText}>Abrir Ajustes</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarcode}
      />
      {scanned && (
        <Pressable style={styles.scanAgain} onPress={() => setScanned(false)}>
          <Text style={styles.scanAgainText}>Tocar para escanear de nuevo</Text>
        </Pressable>
      )}
      <View pointerEvents="none" style={styles.overlay}>
        <View style={styles.guideBox} />
        <Text style={styles.overlayText}>Alinea el QR dentro del recuadro</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  btn: {
    backgroundColor: "#0A84FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10
  },
  btnText: { color: "#fff", fontWeight: "600" },
  scanAgain: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    backgroundColor: "rgba(21, 111, 228, 0.95)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10
  },
  scanAgainText: { fontWeight: "600", color: "#fff" },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  guideBox: { width: 260, height: 260, borderWidth: 3, borderColor: "rgba(255,255,255,0.9)", borderRadius: 16 },
  overlayText: {
    position: "absolute",
    bottom: 130,
    color: "#fff",
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5
  }
});
