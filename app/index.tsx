import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useEffect } from 'react';

import { useAuth } from '@src/context/AuthContext';
import { ONBOARDING_VERSION } from '@constants/onboarding';
import LoginScreen from '@src/components/screens/auth/LoginScreen';
import ActivityIndicatorModal from '@components/common/ActivityIndicatorModal';
import { useUserPreferencesStore } from '@src/store/userPreferencesStore';

export default function InitialScreen() {
  const { isLoggedIn, isLoading, user } = useAuth();

  useEffect(() => {
    /**
     * アプリ起動時処理（ログイン済みの場合のみ）
     */
    const initApp = async () => {
      if (!user?.id) return;

      try {
        const currentVersion = user?.onboardingVersion ?? 0;
        console.log('currentVersion', user?.onboardingVersion);
        console.log('ONBOARDING_VERSION', ONBOARDING_VERSION);
        if (currentVersion < ONBOARDING_VERSION) {
          // オンボーディングが必要な場合はオンボ画面に遷移
          router.replace('/onboarding');

          // キャッシュを呼び出してホームに遷移
        } else {
          await useUserPreferencesStore.getState().hydrateFromCache(user.id);
          router.replace('/home');
        }
      } catch (e) {
        console.log('初期化エラー', e);
      }
    };

    // ログイン状態が確定したら処理を開始
    if (!isLoading && isLoggedIn) {
      initApp();
    }
  }, [isLoggedIn, isLoading, user]);

  // 認証状態のロード中
  if (isLoading) {
    return <ActivityIndicatorModal isLoading={true} loadingText="ログイン中…" />;
  }

  // ログインしていない場合はログイン画面を表示
  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  // ログイン済みで初期化中
  return (
    <View style={styles.container}>
      <ActivityIndicatorModal isLoading={true} loadingText="初期化中…" />
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
