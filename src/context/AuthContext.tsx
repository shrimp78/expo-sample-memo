import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { User } from '../components/types/User';

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ログイン状態の判定
  const isLoggedIn = user !== null;

  // Firebase認証状態の監視
  // ※ onAuthStateChangedがリアルタイムリスナーとしてログイン状態の変更を検知し続ける
  // ※ 外部でのPW変更やアカウント削除、認証設定変更などあらゆる変更に対応（Stateで管理は無理）
  useEffect(() => {
    setIsLoading(true); // ここにもsetすることで、既にログイン済み＆2回目以降のアプリ起動時などにも対応できる

    const unsubscribe = auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email || '',
          picture: firebaseUser.photoURL || undefined
        };
        setUser(user);
        console.log('User signed in:', JSON.stringify(user, null, 2));
      } else {
        setUser(null);
        console.log('User signed out');
      }
      setIsLoading(false);
    });

    // GoogleSigninの設定
    GoogleSignin.configure({
      webClientId: Constants.expoConfig?.extra?.firebaseWebClientId
    });

    return unsubscribe;
  }, []);

  const login = React.useCallback(async () => {
    try {
      setIsLoading(true);

      console.log('=== Firebase Google Sign-In Debug Info ===');
      console.log('Starting Google Sign-In flow...');

      // Google Play services の利用可能性をチェック
      // ※iOSでは不要だが、Androidでは必須の処理
      // ※古いAndroid端末やカスタムROMではErrorが上がるのでcatchに入る
      await GoogleSignin.hasPlayServices();

      // Googleサインインフローを開始
      const signInResult = await GoogleSignin.signIn(); // ここでログイン用モーダルが立ち上がる
      const idToken = signInResult.data?.idToken; // ログインに成功したらトークンが入る

      if (!idToken) {
        throw new Error('IDトークンの取得に失敗しました');
      }

      // Firebase認証用のGoogle認証情報を作成
      // ※Google Sign-InはGoogle固有のフォーマットなので、Firebaseの管理システムで扱えるように変換してもらう
      // ※他のAppleログインなどでも同様の処理が必要
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Firebase Authentication でサインイン
      await auth().signInWithCredential(googleCredential);

      console.log('Firebase Google Sign-In successful');
    } catch (error: any) {
      console.error('Login error:', error);

      // エラーハンドリング
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('ログインがキャンセルされました');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('ログインが既に進行中です');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Servicesが利用できません');
      } else {
        throw new Error(`ログインエラー: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = React.useCallback(async () => {
    try {
      setIsLoading(true);

      // Firebaseからサインアウト
      await auth().signOut();

      // Googleからもサインアウト
      await GoogleSignin.signOut();

      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUserInfo = React.useCallback(async () => {
    try {
      if (!isLoggedIn) return;

      setIsLoading(true);

      // 現在のFirebaseユーザー情報を再取得
      const currentUser = auth().currentUser;

      if (currentUser) {
        // ユーザー情報を再読み込み
        await currentUser.reload();

        const user: User = {
          id: currentUser.uid,
          email: currentUser.email || '',
          name: currentUser.displayName || currentUser.email || '',
          picture: currentUser.photoURL || undefined
        };

        setUser(user);
        console.log('User info refreshed:', user.email);
      }
    } catch (error) {
      console.error('Error refreshing user info:', error);
      // エラーが発生した場合はログアウト状態にする
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  const value: AuthContextType = {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    refreshUserInfo
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
