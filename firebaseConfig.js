import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Firebase設定 (Expoのextraから注入)
const extraFirebase = Constants.expoConfig?.extra?.firebase ?? {};

const firebaseConfig = {
  apiKey: extraFirebase.apiKey,
  authDomain: extraFirebase.authDomain,
  databaseURL: extraFirebase.databaseURL,
  projectId: extraFirebase.projectId,
  storageBucket: extraFirebase.storageBucket,
  messagingSenderId: extraFirebase.messagingSenderId,
  appId: Platform.OS === 'ios' ? extraFirebase.appIdIos : extraFirebase.appIdAndroid
  // measurementId: extraFirebase.measurementId // Google Analytics設定後に追加
};

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// Firebase AuthとFirestoreインスタンスをエクスポート
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const firestore = getFirestore(app);
export const db = getFirestore(app); // firestoreServiceで使用するためのエクスポート
export default app;
