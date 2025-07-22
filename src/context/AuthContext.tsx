import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
      // TODO: Googleログインの実装
      // 1. OAuth認証フローの開始
      // 2. ユーザー情報の取得
      // 3. トークンの保存
      // 4. ユーザー状態の更新

      // サンプル実装（実際のログイン後に置き換える）
      const mockUser: User = {
        id: 'mock_id',
        email: 'user@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg'
      };
      setUser(mockUser);
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
