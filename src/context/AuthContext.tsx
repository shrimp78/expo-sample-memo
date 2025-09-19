import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  deleteUser,
  reauthenticateWithCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { Alert } from 'react-native';
import { auth } from '@root/firebaseConfig';
import { User } from '@components/types/User';
import { getUserByUid, saveUser, updateUserById, deleteUserById } from '@services/userService';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { saveLastAuthProvider, clearLastAuthProvider } from '@services/secureStore';
import { clearUserCache } from '@services/cache';

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isAppleSignInAvailable: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  signUpWithGoogle: () => Promise<void>;
  signUpWithApple: () => Promise<void>;
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
  const [isAppleSignInAvailable, setIsAppleSignInAvailable] = useState<boolean>(false);

  // ログイン状態の判定
  const isLoggedIn = user !== null;

  // Google Sign-InとApple Sign-Inの設定
  useEffect(() => {
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

    const checkAppleSignInAvailability = async () => {
      try {
        if (Platform.OS === 'ios') {
          const isAvailable = await AppleAuthentication.isAvailableAsync();
          setIsAppleSignInAvailable(isAvailable);
          console.log('Apple Sign-In availability:', isAvailable);
        }
      } catch (error) {
        console.error('Apple Sign-In availability check error:', error);
        setIsAppleSignInAvailable(false);
      }
    };

    configureGoogleSignIn();
    checkAppleSignInAvailability();
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
          let user = await getUserByUid(firebaseUser.uid);

          if (!user) {
            // ユーザーが存在しない場合はログインを拒否
            console.log('ユーザーが見つかりません:', firebaseUser.email);

            // 最後に使用したプロバイダをクリア
            await clearLastAuthProvider();

            // Firebase認証からサインアウト
            await signOut(auth);

            // ダイアログを表示
            Alert.alert(
              'ユーザーが見つかりません',
              '初めてログインする場合は新規作成ボタンを押してください',
              [
                {
                  text: '確認',
                  onPress: () => {
                    // ログイン画面に戻る（userがnullになることで自動的に戻る）
                    console.log('ログイン画面に戻ります');
                  }
                }
              ]
            );

            setUser(null);
            setIsLoading(false);
            return;
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
              await updateUserById(firebaseUser.uid, updates);
              user = { ...user, ...updates };
              console.log('ユーザー情報が更新されました:', user.email);
            }
          }

          setUser(user);
          console.log('ユーザーログイン完了:', JSON.stringify(user, null, 2));
        } catch (error) {
          console.error('Firestoreユーザー処理エラー:', error);

          // Firebase認証からサインアウト
          await signOut(auth);

          // エラーダイアログを表示
          Alert.alert(
            'エラーが発生しました',
            'ユーザー情報の取得に失敗しました。もう一度お試しください。',
            [
              {
                text: '確認',
                onPress: () => {
                  console.log('エラーによりログイン画面に戻ります');
                }
              }
            ]
          );

          setUser(null);
          setIsLoading(false);
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

      // 成功したため、最後に使用したプロバイダを保存
      await saveLastAuthProvider('google');

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

  const loginWithApple = React.useCallback(async () => {
    try {
      setIsLoading(true);

      console.log('=== Apple Sign-In Debug Info ===');
      console.log('Starting Apple Sign-In flow...');

      if (!isAppleSignInAvailable) {
        throw new Error('Apple Sign-Inが利用できません');
      }

      // Apple Sign-Inを実行
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL
        ]
      });

      console.log('Apple Sign-In response:', appleCredential);

      const { identityToken, authorizationCode } = appleCredential;
      if (!identityToken) {
        throw new Error('Apple認証トークンが取得できませんでした');
      }

      // Firebase認証プロバイダーを作成
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken: identityToken,
        rawNonce: undefined // 今回はnancel使わない簡単な実装
      });

      // Firebase Authenticationでサインイン
      await signInWithCredential(auth, credential);
      // 成功したため、最後に使用したプロバイダを保存
      await saveLastAuthProvider('apple');

      console.log('Firebase Apple Sign-In successful');
    } catch (error: any) {
      console.error('Apple login error:', error);
      // 成功時は onAuthStateChanged が isLoading を false にする。
      // エラー時のみここで isLoading を false に戻す。
      setIsLoading(false);

      if (error.code === 'ERR_REQUEST_CANCELED') {
        throw new Error('Apple認証がキャンセルされました');
      } else {
        throw new Error(`Appleログインエラー: ${error.message}`);
      }
    }
  }, [isAppleSignInAvailable]);

  const signUpWithGoogle = React.useCallback(async () => {
    try {
      setIsLoading(true);

      console.log('=== Google Sign-Up Debug Info ===');
      console.log('Starting Google Sign-Up flow...');

      // Google Play Servicesが利用可能かチェック
      await GoogleSignin.hasPlayServices();

      // Google Sign-Inを実行
      const response = await GoogleSignin.signIn();
      console.log('Google Sign-Up response:', response);

      // idTokenを取得
      const { data } = response;
      if (!data?.idToken) {
        throw new Error('IDトークンが取得できませんでした');
      }

      // Firebase認証情報を作成（まだサインインはしない）
      const googleCredential = GoogleAuthProvider.credential(data.idToken);

      // 一時的にFirebaseでサインインしてユーザー情報を取得
      const userCredential = await signInWithCredential(auth, googleCredential);
      const firebaseUser = userCredential.user;

      // 既存ユーザーかどうかをチェック
      const existingUser = await getUserByUid(firebaseUser.uid);

      if (existingUser) {
        // 既存ユーザーの場合はサインアウトしてエラーを投げる
        await signOut(auth);
        await GoogleSignin.signOut();
        throw new Error('既にこのユーザーが存在します');
      }

      // 新規ユーザーの場合は作成
      console.log('新規ユーザーを作成します:', firebaseUser.email);

      // 成功したため、最後に使用したプロバイダを保存
      await saveLastAuthProvider('google');

      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email || '',
        picture: firebaseUser.photoURL || undefined
      };

      await saveUser(newUser);
      console.log('新規ユーザーが作成されました:', newUser.email);

      // onAuthStateChangedが新規ユーザーの処理を行うため、ここでは何もしない
      console.log('Firebase Google Sign-Up successful');
    } catch (error: any) {
      console.error('Google signup error:', error);
      // 成功時は onAuthStateChanged が isLoading を false にする。
      // エラー時のみここで isLoading を false に戻す。
      setIsLoading(false);

      if (error.message === '既にこのユーザーが存在します') {
        throw error; // そのまま再スロー
      } else if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Google認証がキャンセルされました');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Google認証が既に進行中です');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Servicesが利用できません');
      } else {
        throw new Error(`Google新規登録エラー: ${error.message}`);
      }
    }
  }, []);

  const signUpWithApple = React.useCallback(async () => {
    try {
      setIsLoading(true);

      console.log('=== Apple Sign-Up Debug Info ===');
      console.log('Starting Apple Sign-Up flow...');

      if (!isAppleSignInAvailable) {
        throw new Error('Apple Sign-Inが利用できません');
      }

      // Apple Sign-Inを実行
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL
        ]
      });

      console.log('Apple Sign-Up response:', appleCredential);

      const { identityToken, fullName, email } = appleCredential;
      if (!identityToken) {
        throw new Error('Apple認証トークンが取得できませんでした');
      }

      // Firebase認証プロバイダーを作成
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken: identityToken,
        rawNonce: undefined // 今回はnonceを使わない簡単な実装
      });

      // 一時的にFirebaseでサインインしてユーザー情報を取得
      const userCredential = await signInWithCredential(auth, credential);
      // 成功したため、最後に使用したプロバイダを保存
      await saveLastAuthProvider('apple');
      const firebaseUser = userCredential.user;

      // 既存ユーザーかどうかをチェック
      const existingUser = await getUserByUid(firebaseUser.uid);

      if (existingUser) {
        // 既存ユーザーの場合はサインアウトしてエラーを投げる
        await signOut(auth);
        throw new Error('既にこのユーザーが存在します');
      }

      // 新規ユーザーの場合は作成
      console.log('新規ユーザーを作成します:', firebaseUser.email || email);

      // Apple認証では表示名やメールアドレスが初回のみ提供されることがある
      const displayName = fullName
        ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
        : firebaseUser.displayName;

      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || email || '',
        name: displayName || firebaseUser.email || email || 'Apple User',
        picture: firebaseUser.photoURL || undefined
      };

      await saveUser(newUser);
      console.log('新規ユーザーが作成されました:', newUser.email);

      // onAuthStateChangedが新規ユーザーの処理を行うため、ここでは何もしない
      console.log('Firebase Apple Sign-Up successful');
    } catch (error: any) {
      console.error('Apple signup error:', error);
      // 成功時は onAuthStateChanged が isLoading を false にする。
      // エラー時のみここで isLoading を false に戻す。
      setIsLoading(false);

      if (error.message === '既にこのユーザーが存在します') {
        throw error; // そのまま再スロー
      } else if (error.code === 'ERR_REQUEST_CANCELED') {
        throw new Error('Apple認証がキャンセルされました');
      } else {
        throw new Error(`Apple新規登録エラー: ${error.message}`);
      }
    }
  }, [isAppleSignInAvailable]);

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
      try {
        // サインアウト後にキャッシュを削除（ユーザー切替でも安全）
        if (user?.id) {
          await clearUserCache(user.id);
        }
      } catch (e) {
        console.warn('Failed to clear cache on logout:', e);
      }
      setIsLoading(false);
    }
  }, []);

  const refreshUserInfo = React.useCallback(async () => {
    try {
      if (!isLoggedIn || !user) return;

      setIsLoading(true);

      // Firestoreから最新のユーザー情報を取得
      const refreshedUser = await getUserByUid(user.id);

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
        await updateUserById(user.id, updates);

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
      // Firestoreのユーザードキュメント（プロフィール等のアプリ用データ）を削除
      // userService側で、Userに紐づくGroupやItemも全て削除するので注意
      await deleteUserById(user.id);
      //  Firebase Authentication 上の「認証アカウント」自体（認証情報・ログイン資格）を削除
      await deleteUser(auth.currentUser);

      // 3. ログアウト
      await GoogleSignin.signOut();

      // 4.前回のサインイン情報をクリア
      await clearLastAuthProvider();

      // 5. 状態をクリアしてナビゲーションの競合を防ぐ
      setUser(null);
      setIsLoading(false);

      console.log('アカウント削除成功');
    } catch (error) {
      console.error('アカウント削除エラー:', error);
      setIsLoading(false);
      throw error;
    } finally {
      try {
        if (user?.id) {
          await clearUserCache(user.id);
        }
      } catch (e) {
        console.warn('Failed to clear cache on account deletion:', e);
      }
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoggedIn,
    isLoading,
    isAppleSignInAvailable,
    loginWithGoogle,
    loginWithApple,
    signUpWithGoogle,
    signUpWithApple,
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

// 認証済みユーザーを必ず返すための補助フック
export const useAuthenticatedUser = (): User => {
  const { user, isLoggedIn } = useAuth();
  if (!isLoggedIn || !user) {
    // ルート側で isLoggedIn 以外は描画しない前提
    // ここに到達するのは設計上の齟齬なので例外にする
    throw new Error('認証済みユーザーが存在しません');
  }
  return user;
};
