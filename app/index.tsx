import { router } from 'expo-router';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import * as Crypto from 'expo-crypto';
import { saveItem, countItemsByUserId } from '@services/itemService';
import { saveGroup, countGroup } from '@services/groupService';

import { initialItemData, initialGroupData } from '../constants/initialData';
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
   * SQLiteとFirestore両方に初期データを保存
   */
  const initDatabase = async () => {
    try {
      // NOTE: ここに到達するのは isLoggedIn が true の時のみ
      const authUserId = user?.id;
      // 念のための安全ガード
      if (!authUserId) {
        throw new Error('ユーザー情報が未取得です');
      }

      const firestoreItemNum = await countItemsByUserId(authUserId);
      const firestoreGroupNum = await countGroup(authUserId);

      // Groupの初期化（SQLiteとFirestore両方）
      if (firestoreGroupNum === 0) {
        console.log('初期グループデータを作成します');
        for (const group of initialGroupData) {
          await saveGroup(authUserId, group.id, group.name, group.color);
        }
      }

      // Itemの初期化（SQLiteとFirestore両方）
      if (firestoreItemNum === 0) {
        console.log('初期アイテムデータを作成します');
        for (const item of initialItemData) {
          const id = Crypto.randomUUID();
          // Firestore（新規）
          await saveItem(authUserId, id, item.title, item.content, item.group_id);
        }
      }

      console.log('データベース初期化が完了しました');
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
