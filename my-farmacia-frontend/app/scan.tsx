// app/scan.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, Pressable } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

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
        <Text style={{ marginBottom: 12 }}>
          Se requiere permiso de cámara para escanear.
        </Text>
        <Pressable style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Conceder permiso</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={
          scanned
            ? undefined
            : ({ data, type }) => {
                setScanned(true);
                Alert.alert("QR escaneado", `Tipo: ${type}\nDatos: ${data}`);
              }
        }
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
    borderRadius: 10,
  },
  btnText: { color: "#fff", fontWeight: "600" },
  scanAgain: {
    position: "absolute",
    bottom: 60,
    alignSelf: "center",
    backgroundColor: "rgba(190, 21, 21, 0.95)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  scanAgainText: { fontWeight: "600" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  guideBox: {
    width: 260,
    height: 260,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
  },
  overlayText: {
    position: "absolute",
    bottom: 120,
    color: "#fff",
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});