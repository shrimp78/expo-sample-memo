import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase設定
// TODO: Firebase Consoleから実際の設定値を取得して置き換えてください
const firebaseConfig = {
  apiKey: 'your-api-key',
  authDomain: 'your-project-id.firebaseapp.com',
  databaseURL: 'https://your-project-id.firebaseio.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project-id.appspot.com',
  messagingSenderId: 'your-messaging-sender-id',
  appId: 'your-app-id',
  measurementId: 'G-your-measurement-id'
};

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// Firebase AuthとFirestoreインスタンスをエクスポート
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export default app;
