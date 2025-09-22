
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';


function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    Alert.alert('Código QR escaneado', `Tipo: ${type}\nDatos: ${data}`);
    // Aquí puedes navegar o procesar el dato escaneado
  };

  if (hasPermission === null) {
    return <View style={styles.center}><Text>Solicitando permiso para la cámara...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.center}><Text>No se tiene acceso a la cámara.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Text style={styles.scanAgain} onPress={() => setScanned(false)}>
          Toca para escanear de nuevo
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanAgain: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },
});

export default ScanScreen;