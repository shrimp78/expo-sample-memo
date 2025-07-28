import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';

// ユーザー情報の型定義
// TODO : これって types の下に持っていった法が良いんじゃないのかな
interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

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
  useEffect(() => {
    setIsLoading(true);

    const unsubscribe = auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email || '',
          picture: firebaseUser.photoURL || undefined
        };
        setUser(user);
        console.log('User signed in:', user.email);
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
      await GoogleSignin.hasPlayServices();

      // Googleサインインフローを開始
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new Error('IDトークンの取得に失敗しました');
      }

      // Firebase認証用のGoogle認証情報を作成
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
