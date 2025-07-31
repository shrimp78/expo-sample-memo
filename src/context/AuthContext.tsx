import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { User } from '../components/types/User';
import {
  getUserFromFirestore,
  createUserInFirestore,
  updateUserInFirestore
} from '../services/userService';

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserInfo: () => Promise<void>;
  updateUserProfile: (updates: Partial<Omit<User, 'id'>>) => Promise<void>; // なにこれ
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

    const unsubscribe = auth().onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        try {
          // Firestoreからユーザー情報を取得
          let user = await getUserFromFirestore(firebaseUser.uid);

          if (!user) {
            // ユーザーが存在しない場合は新規作成
            console.log('新規ユーザーを作成します:', firebaseUser.email);

            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email || '',
              picture: firebaseUser.photoURL || undefined
            };

            await createUserInFirestore(newUser);
            user = newUser;
            console.log('新規ユーザーが作成されました:', user.email);
          } else {
            console.log('既存ユーザーが読み込まれました:', user.email);

            // Firebase認証情報が更新されている場合はFirestoreも更新
            const updates: Partial<Omit<User, 'id'>> = {};
            let hasUpdates = false;

            if (firebaseUser.email && firebaseUser.email !== user.email) {
              updates.email = firebaseUser.email;
              hasUpdates = true;
            }

            if (firebaseUser.displayName && firebaseUser.displayName !== user.name) {
              updates.name = firebaseUser.displayName;
              hasUpdates = true;
            }

            if (firebaseUser.photoURL && firebaseUser.photoURL !== user.picture) {
              updates.picture = firebaseUser.photoURL;
              hasUpdates = true;
            }

            if (hasUpdates) {
              await updateUserInFirestore(firebaseUser.uid, updates);
              user = { ...user, ...updates };
              console.log('ユーザー情報が更新されました:', user.email);
            }
          }

          setUser(user);
          console.log('ユーザーログイン完了:', JSON.stringify(user, null, 2));
        } catch (error) {
          console.error('Firestoreユーザー処理エラー:', error);
          // エラーが発生した場合はFirebase認証情報のみでユーザーを作成
          const fallbackUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email || '',
            picture: firebaseUser.photoURL || undefined
          };
          setUser(fallbackUser);
        }
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
      if (!isLoggedIn || !user) return;

      setIsLoading(true);

      // Firestoreから最新のユーザー情報を取得
      const refreshedUser = await getUserFromFirestore(user.id);

      if (refreshedUser) {
        setUser(refreshedUser);
        console.log('ユーザー情報を更新しました:', refreshedUser.email);
      } else {
        console.warn('Firestoreにユーザー情報が見つかりません');
        // ユーザーが削除されている場合はログアウト
        setUser(null);
      }
    } catch (error) {
      console.error('ユーザー情報更新エラー:', error);
      // エラーが発生した場合はログアウト状態にする
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, user]);

  const updateUserProfile = React.useCallback(
    async (updates: Partial<Omit<User, 'id'>>) => {
      try {
        if (!isLoggedIn || !user) {
          throw new Error('ユーザーがログインしていません');
        }

        setIsLoading(true);

        // Firestoreのユーザー情報を更新
        await updateUserInFirestore(user.id, updates);

        // ローカルStateも更新
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);

        console.log('ユーザープロフィールが更新されました:', updatedUser.email);
      } catch (error) {
        console.error('ユーザープロフィール更新エラー:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isLoggedIn, user]
  );

  const value: AuthContextType = {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    refreshUserInfo,
    updateUserProfile
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
