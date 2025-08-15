import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.taller.celulares",
  appName: "Taller Celulares",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1f2937",
      showSpinner: false,
      androidSpinnerStyle: "large",
      spinnerColor: "#ffffff",
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#1f2937",
    },
  },
}

export default config
