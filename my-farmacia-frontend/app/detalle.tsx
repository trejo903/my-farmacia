import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

type RecordType = { nombre: string; folio: string }; // ajusta a tu API

export default function Detalle() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<RecordType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const resp = await fetch(
          `https://api.tu-dominio.com/pacientes/${encodeURIComponent(String(id))}`,
          { headers: { Accept: "application/json" } }
        );
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = (await resp.json()) as RecordType;
        if (!abort) setData(json);
      } catch (e: any) {
        if (!abort) setError(e?.message ?? "Error de red");
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 12 }}>Consultando datos…</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "crimson", marginBottom: 8 }}>
          {error ? `Error: ${error}` : "Sin resultados"}
        </Text>
        <Pressable onPress={() => router.replace("/scan")} style={styles.btn}>
          <Text style={styles.btnText}>Volver a escanear</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Detalle</Text>
      <Text>Nombre: {data.nombre}</Text>
      <Text>Folio: {data.folio}</Text>
      <Pressable onPress={() => router.replace("/scan")} style={[styles.btn, { marginTop: 20 }]}>
        <Text style={styles.btnText}>Escanear otro QR</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  page: { flex: 1, padding: 16, gap: 8 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  btn: { backgroundColor: "#0A84FF", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  btnText: { color: "#fff", fontWeight: "600" }
});
