import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Google OAuth設定
const GOOGLE_CLIENT_ID = Constants.expoConfig?.extra?.googleClientId;

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

  // アプリ起動時の認証状態確認
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      // TODO: ここで保存されたトークンや認証状態を確認
      // AsyncStorageやSecureStoreから認証情報を取得
      // 有効な認証情報があればユーザー情報を設定
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = React.useCallback(async () => {
    try {
      setIsLoading(true);

      // 1. OAuth認証フローの設定
      // Google Cloud Consoleが受け入れるリダイレクトURIを使用
      const redirectUri = __DEV__
        ? 'http://localhost:8081'
        : AuthSession.makeRedirectUri({
            scheme: 'mt-app'
          });

      // デバッグ: リダイレクトURIをコンソールに出力
      console.log('=== Google OAuth Debug Info ===');
      console.log('Redirect URI:', redirectUri);
      console.log('Client ID:', GOOGLE_CLIENT_ID);
      console.log('Platform:', Platform.OS);
      console.log('==============================');

      // PKCE (Proof Key for Code Exchange) 設定
      const codeVerifier = Math.random().toString(36).substring(2, 15);
      const codeChallenge = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        codeVerifier,
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );

      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        codeChallenge,
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
        state: Math.random().toString(36).substring(2, 15)
      });

      // 2. 認証フローの開始
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth'
      });

      if (result.type === 'success') {
        // 3. 認証コードの取得とアクセストークンの交換
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            clientId: GOOGLE_CLIENT_ID,
            code: result.params.code,
            redirectUri,
            extraParams: {}
          },
          {
            tokenEndpoint: 'https://oauth2.googleapis.com/token'
          }
        );

        // 4. ユーザー情報の取得
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResult.accessToken}`
        );
        const userInfo = await userInfoResponse.json();

        // 5. ユーザー状態の更新
        const user: User = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture
        };

        setUser(user);

        // TODO: トークンをSecureStoreに保存
        // await SecureStore.setItemAsync('access_token', tokenResult.accessToken);
        // await SecureStore.setItemAsync('refresh_token', tokenResult.refreshToken);
      } else {
        throw new Error('ログインがキャンセルされました');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = React.useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: ログアウトの実装
      // 1. トークンの削除
      // 2. ユーザー状態のクリア
      // 3. Google認証の取り消し

      setUser(null);
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
      // TODO: ユーザー情報の再取得
      // Google People APIからユーザー情報を取得して更新
    } catch (error) {
      console.error('Error refreshing user info:', error);
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
