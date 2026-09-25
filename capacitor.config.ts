import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.zenkiet.boreas',
  appName: 'Boreas',
  webDir: 'dist/boreas-client/browser',
  // The launch blue, so the WebView never flashes white or black before the web splash paints.
  backgroundColor: '#0088ff',
  ios: {
    // the long-press link-preview sheet reads as browser chrome inside an app
    allowsLinkPreview: false,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
