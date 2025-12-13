import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@src/context/AuthContext';
import { ONBOARDING_VERSION } from '@constants/onboarding';
import LoginScreen from '@src/components/screens/auth/LoginScreen';
import ActivityIndicatorModal from '@components/common/ActivityIndicatorModal';
import { useUserPreferencesStore } from '@src/store/userPreferencesStore';

export default function InitialScreen() {
  const { isLoggedIn, isLoading, user, logout } = useAuth();
  const [initPhase, setInitPhase] = useState<'idle' | 'initializing' | 'error'>('idle');
  const [initErrorMessage, setInitErrorMessage] = useState<string | null>(null);
  const initInProgressRef = useRef(false);

  useEffect(() => {
    /**
     * アプリ起動時処理（ログイン済みの場合のみ）
     */
    const initApp = async () => {
      if (!user?.id) {
        throw new Error('ユーザー情報が取得できませんでした');
      }

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
        throw e;
      }
    };

    // ログイン状態が確定したら処理を開始
    if (!isLoading && isLoggedIn) {
      // すでにエラー表示中なら勝手に再実行しない（ユーザー操作で再試行させる）
      if (initPhase === 'error') return;
      // 二重起動防止（依存配列の変化でuseEffectが複数回走り得る）
      if (initInProgressRef.current) return;

      initInProgressRef.current = true;
      setInitPhase('initializing');
      setInitErrorMessage(null);

      void initApp()
        .catch((e: unknown) => {
          const message = e instanceof Error ? e.message : String(e);
          setInitErrorMessage(message);
          setInitPhase('error');
        })
        .finally(() => {
          initInProgressRef.current = false;
        });
    } else {
      // ログアウト等で状態が変わった場合は初期化状態をリセット
      setInitPhase('idle');
      setInitErrorMessage(null);
      initInProgressRef.current = false;
    }
  }, [isLoggedIn, isLoading, user?.id, user?.onboardingVersion, initPhase]);

  // 認証状態のロード中
  if (isLoading) {
    return <ActivityIndicatorModal isLoading={true} loadingText="ログイン中…" />;
  }

  // ログインしていない場合はログイン画面を表示
  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  // ログイン済みだが初期化に失敗した場合は、無限ローディングにならないようエラー画面を表示
  if (initPhase === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>初期化に失敗しました</Text>
        <Text style={styles.errorMessage}>{initErrorMessage ?? '不明なエラーが発生しました'}</Text>

        <View style={styles.errorButtons}>
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={() => {
              // useEffect側が再実行する
              setInitPhase('idle');
              setInitErrorMessage(null);
            }}
          >
            <Text style={styles.primaryButtonText}>再試行</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={() => {
              void logout();
            }}
          >
            <Text style={styles.secondaryButtonText}>ログアウト</Text>
          </Pressable>
        </View>
      </View>
    );
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
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
    textAlign: 'center'
  },
  errorMessage: {
    fontSize: 14,
    color: '#444',
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 24
  },
  errorButtons: {
    width: '100%',
    maxWidth: 320,
    gap: 12
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryButton: {
    backgroundColor: '#111'
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  secondaryButtonText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '600'
  }
});
