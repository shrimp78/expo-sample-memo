import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Google OAuth設定
const GOOGLE_CLIENT_ID = Constants.expoConfig?.extra?.googleClientId;
const IOS_GCP_CLIENT_ID = Constants.expoConfig?.extra?.iosGoogleClientId;

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

  // GoogleSigninの設定
  useEffect(() => {
    const setupGoogleSignin = async () => {
      try {
        GoogleSignin.configure({
          iosClientId: IOS_GCP_CLIENT_ID, // ClientID
          hostedDomain: '', // GSuite組織ドメイン（空の場合は全てのGoogleアカウント）
          forceCodeForRefreshToken: true, // iOS でリフレッシュトークンを強制取得
          accountName: '' // アカウント名（空の場合は全てのアカウント）
        });

        console.log('GoogleSignin configured successfully');
      } catch (error) {
        console.error('Error configuring GoogleSignin:', error);
      }
    };

    setupGoogleSignin();
  }, []);

  // アプリ起動時の認証状態確認
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);

      // 現在のユーザー情報を直接取得して、サインイン状態を確認
      const userInfo = await GoogleSignin.getCurrentUser();

      if (userInfo) {
        // 既にサインインしている場合、ユーザー情報を設定
        const user: User = {
          id: userInfo.user.id,
          email: userInfo.user.email,
          name: userInfo.user.name || userInfo.user.email,
          picture: userInfo.user.photo || undefined
        };

        setUser(user);
        console.log('User already signed in:', user.email);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      // エラーが発生した場合はログアウト状態として扱う
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = React.useCallback(async () => {
    try {
      setIsLoading(true);

      // デバッグ: GoogleSignin設定確認
      console.log('=== Google Sign-In Debug Info ===');
      console.log('Platform:', Platform.OS);
      console.log('iOS ClientID:', IOS_GCP_CLIENT_ID);
      console.log('================================');

      // Google Play services の利用可能性をチェック
      await GoogleSignin.hasPlayServices();

      // サインインフローを開始
      const signInResult = await GoogleSignin.signIn();

      // TypeScript型エラーを回避するために any 型を使用
      const userInfo = signInResult as any;

      console.log('Sign-in successful:', userInfo.user ? userInfo.user.email : userInfo.email);

      // ユーザー情報を設定
      const user: User = {
        id: userInfo.user ? userInfo.user.id : userInfo.id,
        email: userInfo.user ? userInfo.user.email : userInfo.email,
        name: userInfo.user
          ? userInfo.user.name || userInfo.user.email
          : userInfo.name || userInfo.email,
        picture: userInfo.user ? userInfo.user.photo : userInfo.photo
      };

      setUser(user);
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

      // Googleからサインアウト
      await GoogleSignin.signOut();

      // ユーザー状態をクリア
      setUser(null);

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

      // 現在のユーザー情報を再取得
      const userInfo = await GoogleSignin.getCurrentUser();

      if (userInfo) {
        const user: User = {
          id: userInfo.user.id,
          email: userInfo.user.email,
          name: userInfo.user.name || userInfo.user.email,
          picture: userInfo.user.photo || undefined
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
