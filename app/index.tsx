import { router } from 'expo-router';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import * as ItemService from '../src/services/itemService';
import * as Crypto from 'expo-crypto';
import * as GroupService from '../src/services/groupService';
import * as FirestoreService from '../src/services/firestoreService';

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
      // テーブル作成と初期データ挿入を順次実行
      await ItemService.createTable();
      console.log('Item table created');

      await GroupService.createTable();
      console.log('Group table created');

      await initDatabase();

      // 初期化が完了したら、ホーム画面に遷移
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
    if (!user) {
      console.log('ユーザーが認証されていません');
      return;
    }

    try {
      // SQLiteの初期化（既存の処理）
      const itemNum = await ItemService.countItems();
      const groupNum = await GroupService.countGroups();

      // Firestoreの初期化（新規追加）
      const firestoreItemNum = await FirestoreService.countUserItemsInFirestore(user.id);
      const firestoreGroupNum = await FirestoreService.countUserGroupsInFirestore(user.id);

      // Groupの初期化（SQLiteとFirestore両方）
      if (groupNum === 0 || firestoreGroupNum === 0) {
        console.log('初期グループデータを作成します');
        for (const group of initialGroupData) {
          // SQLite（既存）
          if (groupNum === 0) {
            await GroupService.insertGroup(group.id, group.name, group.color, group.position);
          }
          // Firestore（新規）
          if (firestoreGroupNum === 0) {
            await FirestoreService.saveGroupToFirestore(user.id, group);
          }
        }
      }

      // Itemの初期化（SQLiteとFirestore両方）
      if (itemNum === 0 || firestoreItemNum === 0) {
        console.log('初期アイテムデータを作成します');
        for (const item of initialItemData) {
          const id = Crypto.randomUUID();
          // SQLite（既存）
          if (itemNum === 0) {
            await ItemService.createItem(id, item.title, item.content, item.group_id);
          }
          // Firestore（新規）
          if (firestoreItemNum === 0) {
            await FirestoreService.saveItemToFirestore(user.id, {
              id,
              title: item.title,
              content: item.content,
              group_id: item.group_id
            });
          }
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
