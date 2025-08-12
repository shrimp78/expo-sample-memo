import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  deleteUser,
  reauthenticateWithCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { User } from '@components/types/User';
import {
  getUserFromFirestore,
  createUserInFirestore,
  updateUserInFirestore,
  deleteUserFromFirestore
} from '@services/userService';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUserInfo: () => Promise<void>;
  updateUserProfile: (updates: Partial<Omit<User, 'id'>>) => Promise<void>;
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

  // Google Sign-Inの設定
  React.useEffect(() => {
    const configureGoogleSignIn = () => {
      try {
        const webClientId = Constants.expoConfig?.extra?.firebaseWebClientId;

        if (!webClientId) {
          console.error('Firebase Web Client IDが設定されていません');
          return;
        }

        GoogleSignin.configure({
          webClientId: webClientId,
          offlineAccess: true
        });

        console.log('Google Sign-In configured successfully');
      } catch (error) {
        console.error('Google Sign-In configuration error:', error);
      }
    };

    configureGoogleSignIn();
  }, []);

  // Firebase認証状態の監視
  // ※ onAuthStateChangedがリアルタイムリスナーとしてログイン状態の変更を検知し続ける
  // ※ 外部でのPW変更やアカウント削除、認証設定変更などあらゆる変更に対応（Stateで管理は無理）
  useEffect(() => {
    setIsLoading(true); // ここにもsetすることで、既にログイン済み＆2回目以降のアプリ起動時などにも対応できる

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
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

    return unsubscribe;
  }, []);

  const loginWithGoogle = React.useCallback(async () => {
    try {
      setIsLoading(true);

      console.log('=== Google Sign-In Debug Info ===');
      console.log('Starting Google Sign-In flow...');

      // Google Play Servicesが利用可能かチェック
      await GoogleSignin.hasPlayServices();

      // Google Sign-Inを実行
      // ここでログイン用のモーダルが出現する
      const response = await GoogleSignin.signIn();

      console.log('Google Sign-In response:', response);

      // idTokenを取得
      const { data } = response;
      if (!data?.idToken) {
        throw new Error('IDトークンが取得できませんでした');
      }

      // Google認証プロバイダーを作成
      const googleCredential = GoogleAuthProvider.credential(data.idToken);

      // Firebase Authenticationでサインイン
      await signInWithCredential(auth, googleCredential);

      console.log('Firebase Google Sign-In successful');
    } catch (error: any) {
      console.error('Google login error:', error);
      // 成功時は onAuthStateChanged が isLoading を false にする。
      // エラー時のみここで isLoading を false に戻す。
      setIsLoading(false);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Google認証がキャンセルされました');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Google認証が既に進行中です');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Servicesが利用できません');
      } else {
        throw new Error(`Googleログインエラー: ${error.message}`);
      }
    }
  }, []);

  const loginWithEmail = React.useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);

      console.log('=== Email Sign-In Debug Info ===');
      console.log('Starting Email Sign-In flow...');

      // Firebase Authenticationでメールとパスワードでサインイン
      await signInWithEmailAndPassword(auth, email, password);

      console.log('Firebase Email Sign-In successful');
    } catch (error: any) {
      console.error('Email login error:', error);
      // 成功時は onAuthStateChanged が isLoading を false にする。
      // エラー時のみここで isLoading を false に戻す。
      setIsLoading(false);

      if (error.code === 'auth/user-not-found') {
        throw new Error('このメールアドレスは登録されていません');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('パスワードが間違っています');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('メールアドレスの形式が正しくありません');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('このアカウントは無効化されています');
      } else {
        throw new Error(`メールログインエラー: ${error.message}`);
      }
    }
  }, []);

  const logout = React.useCallback(async () => {
    try {
      setIsLoading(true);

      // Googleからサインアウト
      try {
        await GoogleSignin.signOut();
      } catch (googleSignOutError) {
        console.warn('Google sign out error (non-critical):', googleSignOutError);
      }

      // Firebaseからサインアウト
      await signOut(auth);

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

  // アカウント削除
  const deleteAccount = React.useCallback(async () => {
    try {
      if (!user || !auth.currentUser) {
        throw new Error('ユーザーがログインしていません');
      }
      setIsLoading(true);

      // 1. 再認証の実施（Googleログインユーザの場合）
      const response = await GoogleSignin.signIn();
      const { data } = response;
      if (!data?.idToken) {
        throw new Error('再認証に失敗しました');
      }
      const googleCredential = GoogleAuthProvider.credential(data.idToken);
      await reauthenticateWithCredential(auth.currentUser, googleCredential);
      console.log('再認証成功');

      // 2. アカウント削除
      await deleteUserFromFirestore(user.id);
      await deleteUser(auth.currentUser);

      // 2.5 TODO:将来的にUserに紐づくGroupやItemも全て削除する

      // 3. ログアウト
      await GoogleSignin.signOut();

      console.log('アカウント削除成功');
    } catch (error) {
      console.error('アカウント削除エラー:', error);
      throw error; // これなんで？
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoggedIn,
    isLoading,
    loginWithGoogle,
    loginWithEmail,
    logout,
    deleteAccount,
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
