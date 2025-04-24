import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

export default function InitialScreen() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // 初回マウント時に呼ばれる
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        router.replace('/home');
      } catch (e) {
        console.log('初期化エラー', e);
      }
    }
  }, [isMounted]);

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
