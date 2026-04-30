import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "com.studywar.app",
  appName: "StudyWar",
  webDir: "out",
  bundledWebRuntime: false,
  server: {
    // Connects to the live Vercel web app for the mobile wrapper
    url: "https://your-app.vercel.app", 
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
