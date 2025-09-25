import { router } from 'expo-router';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';

import { useAuth } from '../src/context/AuthContext';
import { ONBOARDING_VERSION } from '@constants/onboarding';
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
      const currentVersion = user?.onboardingVersion ?? 0;
      if (currentVersion < ONBOARDING_VERSION) {
        router.replace('/onboarding');
      } else {
        router.replace('/home');
      }
    } catch (e) {
      console.log('初期化エラー', e);
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
