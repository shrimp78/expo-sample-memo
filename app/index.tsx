import { router } from 'expo-router';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import * as Crypto from 'expo-crypto';
import { saveItem, countItemsByUserId } from '@services/itemService';
import { saveGroup, countGroup } from '@services/groupService';

import { useAuth } from '../src/context/AuthContext';
import LoginScreen from '../src/components/screens/auth/LoginScreen';

export default function InitialScreen() {
  const { isLoggedIn, isLoading, user } = useAuth();

  useEffect(() => {
    // ログイン状態が確定したら処理を開始
    if (!isLoading) {
      if (isLoggedIn) {
        initApp();
      }
    }
  }, [isLoggedIn, isLoading]);

  /**
   * アプリ起動時処理（ログイン済みの場合のみ）
   */
  const initApp = async () => {
    try {
      await initDatabase();
      router.replace('/home');
    } catch (e) {
      console.log('初期化エラー', e);
    }
  };

  /**
   * データベース初期化処理
   */
  const initDatabase = async () => {
    try {
      // NOTE: ここに到達するのは isLoggedIn が true の時のみ
      // ログイン済みになる前に useAuthenticatedUserを呼び出すとエラーになるのでuserを使っている
      const authUserId = user?.id;
      // 念のための安全ガード
      if (!authUserId) {
        throw new Error('ユーザー情報が未取得です');
      }

      const itemCount = await countItemsByUserId(authUserId); // アイテム数の取得いらなくなるかも？　本当に不要ならあとで消す
      const groupCount = await countGroup(authUserId);
    } catch (error) {
      console.error('データベース初期化中にエラーが発生しました:', error);
      throw error;
    }
  };

  // 認証状態のロード中
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#999" />
      </View>
    );
  }

  // ログインしていない場合はログイン画面を表示
  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  // ログイン済みで初期化中
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#999" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 16
  }
});
