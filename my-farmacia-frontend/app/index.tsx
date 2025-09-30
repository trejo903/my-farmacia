import { Redirect } from "expo-router";

export default function Index() {
  // Al salir del splash nativo, vamos directo al escáner
  return <Redirect href="/scan" />;
}
