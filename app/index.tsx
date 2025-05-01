import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import * as ItemService from '../src/services/itemService';

export default function InitialScreen() {
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      await ItemService.createTable();

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
