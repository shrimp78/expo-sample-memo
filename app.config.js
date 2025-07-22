export default {
  expo: {
    name: 'mt-app',
    slug: 'mt-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.shrimp78.mt-app'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.shrimp78.mt-app'
    },
    web: {
      favicon: './assets/favicon.png'
    },
    plugins: ['expo-router', 'expo-sqlite'],
    extra: {
      iosClientId: process.env.IOS_GCP_OAUTH_CLIENT_ID,
      androidClientId: process.env.AND_GCP_OAUTH_CLIENT_ID
    }
  },
  scheme: 'mt-app'
};
