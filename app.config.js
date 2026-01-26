import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const APP_VARIANT = process.env.APP_VARIANT || 'development';
const IS_PROD = APP_VARIANT === 'production';

const envFile = IS_PROD ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(__dirname, envFile) });

/**
 * PlistのXML文字列から特定のキーの値を抽出するヘルパー
 */
function getValueFromPlist(content, key) {
  if (!content) return undefined;
  const regex = new RegExp(`<key>${key}</key>\\s*<string>([^<]+)</string>`);
  const match = content.match(regex);
  return match ? match[1] : undefined;
}

export default ({ config }) => {
  // 環境に応じた設定
  const plistFilename = IS_PROD ? 'GoogleService-Info.plist' : 'GoogleService-Info.dev.plist';
  const plistSecretName = IS_PROD ? 'GOOGLE_SERVICE_INFO_PLIST' : 'GOOGLE_SERVICE_INFO_PLIST_DEV';

  // Plistの中身を取得
  let plistContent = '';
  const localPlistPath = path.resolve(__dirname, plistFilename);

  if (process.env[plistSecretName]) {
    // EAS Secretsから取得（パスが渡されている場合は読み込み、中身が直接入っている場合はそのまま使用）
    const secretValue = process.env[plistSecretName];
    if (secretValue.startsWith('/')) {
      if (fs.existsSync(secretValue)) {
        plistContent = fs.readFileSync(secretValue, 'utf8');
      }
    } else {
      plistContent = secretValue;
    }
  } else if (fs.existsSync(localPlistPath)) {
    // ローカルファイルから取得
    plistContent = fs.readFileSync(localPlistPath, 'utf8');
  }

  // Plistから値を抽出
  const projectIdFromPlist = getValueFromPlist(plistContent, 'PROJECT_ID');
  const firebaseConfig = {
    apiKey: getValueFromPlist(plistContent, 'API_KEY') || process.env.FIREBASE_API_KEY,
    authDomain: projectIdFromPlist
      ? `${projectIdFromPlist}.firebaseapp.com`
      : process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: projectIdFromPlist || process.env.FIREBASE_PROJECT_ID,
    storageBucket:
      getValueFromPlist(plistContent, 'STORAGE_BUCKET') || process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId:
      getValueFromPlist(plistContent, 'GCM_SENDER_ID') || process.env.FIREBASE_MESSAGING_SENDER_ID,
    appIdIos: getValueFromPlist(plistContent, 'GOOGLE_APP_ID') || process.env.FIREBASE_APP_ID_IOS,
    appIdAndroid: process.env.FIREBASE_APP_ID_ANDROID
  };

  return {
    ...config,
    expo: {
      name:
        APP_VARIANT === 'production'
          ? 'EXPO_SAMPLE_MEMO'
          : APP_VARIANT === 'preview'
            ? 'EXPO_SAMPLE_MEMO (Preview)'
            : 'EXPO_SAMPLE_MEMO (Dev)',
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
        bundleIdentifier: IS_PROD ? 'com.shrimp78.spd-app' : 'com.shrimp78.spdapp.dev',
        googleServicesFile: `./${plistFilename}`,
        usesAppleSignIn: true
      },
      android: {
        adaptiveIcon: {
          foregroundImage: './assets/adaptive-icon.png',
          backgroundColor: '#ffffff'
        },
        package: IS_PROD ? 'com.shrimp78.spdapp' : 'com.shrimp78.spdapp.dev'
      },
      web: {
        favicon: './assets/favicon.png'
      },
      plugins: [
        'expo-router',
        '@react-native-google-signin/google-signin',
        'expo-apple-authentication',
        'expo-secure-store',
        'expo-notifications',
        'expo-updates'
      ],
      updates: {
        url: 'https://u.expo.dev/6be47e36-1646-485e-8975-68daf92001cf'
      },
      runtimeVersion: {
        policy: 'appVersion'
      },
      extra: {
        firebaseWebClientId: process.env.FIREBASE_WEB_CLIENT_ID,
        firebase: firebaseConfig,
        eas: { projectId: '6be47e36-1646-485e-8975-68daf92001cf' }
      }
    }
  };
};
