import 'dotenv/config';
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
      bundleIdentifier: 'com.shrimp78.mt-app',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
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
    plugins: [
      'expo-router',
      'expo-sqlite',
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme: `com.googleusercontent.apps.${process.env.IOS_GCP_CLIENT_ID}`
        }
      ]
    ],
    extra: {
      googleClientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      iosGoogleClientId: process.env.IOS_GCP_CLIENT_ID,
      eas: {
        projectId: '8f1073c1-924d-47c7-81e3-58a83ab48cea'
      }
    }
  },
  scheme: 'mt-app'
};
console.log('iOS GCP Client ID:', process.env.IOS_GCP_CLIENT_ID);
