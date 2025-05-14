import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import * as ItemService from '../src/services/itemService';
import { v4 as uuidv4 } from 'uuid';

import initialItemData from '../src/data/initialItemData.json';

export default function InitialScreen() {
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      await ItemService.createTable();

      // レコードが0件なら初期データをINSERT
      const num = await ItemService.countItems();
      if (num === 0) {
        console.log('Item Count が0件なので初期データをINSERTします');
        for (const key in initialItemData) {
          await ItemService.createItem(uuidv4(), initialItemData[key].title, initialItemData[key].content);
        }
      }

      // 初期化が完了したら、ホーム画面に遷移
      router.replace('/home');
    } catch (e) {
      console.log('初期化エラー', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>アプリ起動中...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEF4',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  }
});
