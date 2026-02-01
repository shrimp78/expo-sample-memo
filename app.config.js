import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const APP_VARIANT = process.env.APP_VARIANT || 'development';
const IS_PROD = APP_VARIANT === 'production';

const envFile = IS_PROD ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(__dirname, envFile) });

const IOS_BUILD_NUMBER = process.env.IOS_BUILD_NUMBER || '1';
const ANDROID_VERSION_CODE = Number.parseInt(process.env.ANDROID_VERSION_CODE || '1', 10) || 1;

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
  const plistSecretValue = process.env[plistSecretName];

  // Plistの中身を取得
  let plistContent = '';
  const localPlistPath = path.resolve(__dirname, plistFilename);

  if (plistSecretValue) {
    // EAS Secretsから取得（パスが渡されている場合は読み込み、中身が直接入っている場合はそのまま使用）
    if (plistSecretValue.startsWith('/')) {
      if (fs.existsSync(plistSecretValue)) {
        plistContent = fs.readFileSync(plistSecretValue, 'utf8');
      }
    } else {
      plistContent = plistSecretValue;
    }
  } else if (fs.existsSync(localPlistPath)) {
    // ローカルファイルから取得
    plistContent = fs.readFileSync(localPlistPath, 'utf8');
  }

  // iOSのGoogleService-Info.plistは、EASのFile環境変数で「ビルダー上の絶対パス」が渡せる。
  // その場合はローカル相対パスではなく、その絶対パスを参照する。
  const googleServicesFile =
    plistSecretValue && plistSecretValue.startsWith('/') ? plistSecretValue : `./${plistFilename}`;

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
      version: '1.0.0', //アプリのバージョン（ユーザーに見えるバージョンにもなる）
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
        // NOTE: Bundle Identifier は英数字とドットのみ（ハイフン不可）
        bundleIdentifier: IS_PROD ? 'com.shrimp78.spdapp' : 'com.shrimp78.spdapp.dev',
        // app.config.js（動的設定）では eas.json の autoIncrement が使えないため、必要なら手動/CIで管理する
        buildNumber: IOS_BUILD_NUMBER,
        googleServicesFile,
        infoPlist: {
          // EASの質問「標準/免除暗号化のみ使用」への回答をInfo.plistへ反映
          ITSAppUsesNonExemptEncryption: false
        },
        usesAppleSignIn: true
      },
      android: {
        adaptiveIcon: {
          foregroundImage: './assets/adaptive-icon.png',
          backgroundColor: '#ffffff'
        },
        package: IS_PROD ? 'com.shrimp78.spdapp' : 'com.shrimp78.spdapp.dev',
        versionCode: ANDROID_VERSION_CODE
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
