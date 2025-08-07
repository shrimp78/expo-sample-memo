import 'dotenv/config';
export default {
  expo: {
    name: 'mt-app',
    slug: 'mt-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: false,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.shrimp78.mtapp',
      googleServicesFile: './GoogleService-Info.plist'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.shrimp78.mtapp'
    },
    web: {
      favicon: './assets/favicon.png'
    },
    plugins: ['expo-router', 'expo-sqlite', '@react-native-google-signin/google-signin'],
    extra: {
      firebaseWebClientId: process.env.FIREBASE_WEB_CLIENT_ID,
      eas: {
        projectId: '8f1073c1-924d-47c7-81e3-58a83ab48cea'
      }
    }
  },
  scheme: 'com.shrimp78.mtapp'
};
