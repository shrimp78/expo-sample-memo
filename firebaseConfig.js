import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Firebase設定
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId:
    Platform.OS === 'ios' ? process.env.FIREBASE_APP_ID_IOS : process.env.FIREBASE_APP_ID_ANDROID
  // measurementId: process.env.FIREBASE_MEASUREMENT_ID // Google Analytics設定後に追加
};

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// Firebase AuthとFirestoreインスタンスをエクスポート
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const firestore = getFirestore(app);
export default app;
