import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    expo: {
      name: 'EXPO_SAMPLE_MEMO',
      slug: 'EXPO_SAMPLE_MEMO',
      version: '1.0.0',
      orientation: 'portrait',
      icon: './assets/icon.png',
      userInterfaceStyle: 'light',
      newArchEnabled: false,
      scheme: 'com.shrimp78.spd-app',
      splash: {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff'
      },
      ios: {
        supportsTablet: true,
        bundleIdentifier: 'com.shrimp78.spd-app',
        googleServicesFile: './GoogleService-Info.plist',
        usesAppleSignIn: true
      },
      android: {
        adaptiveIcon: {
          foregroundImage: './assets/adaptive-icon.png',
          backgroundColor: '#ffffff'
        },
        package: 'com.shrimp78.spdapp'
      },
      web: {
        favicon: './assets/favicon.png'
      },
      plugins: [
        'expo-router',
        '@react-native-google-signin/google-signin',
        'expo-apple-authentication',
        'expo-secure-store'
      ],
      extra: {
        firebaseWebClientId: process.env.FIREBASE_WEB_CLIENT_ID,
        firebase: {
          apiKey: process.env.FIREBASE_API_KEY,
          authDomain: process.env.FIREBASE_AUTH_DOMAIN,
          databaseURL: process.env.FIREBASE_DATABASE_URL,
          projectId: process.env.FIREBASE_PROJECT_ID,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
          appIdIos: process.env.FIREBASE_APP_ID_IOS,
          appIdAndroid: process.env.FIREBASE_APP_ID_ANDROID
        },
        eas: {}
      }
    }
  };
};
