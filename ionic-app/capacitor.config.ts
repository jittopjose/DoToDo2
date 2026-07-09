import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dotodo.app',
  appName: 'DoToDo2',
  webDir: '../web',
  server: {
    androidScheme: 'https',
  },
};

export default config;
