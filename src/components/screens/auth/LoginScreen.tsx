import { StyleSheet, Text, View, TouchableOpacity, Alert, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { router } from 'expo-router';
import { getLastAuthProvider } from '@services/secureStore';
import { GoogleLoginButton, AppleLoginButton } from '@components/screens/auth/LoginButton';

export default function LoginScreen() {
  const { loginWithGoogle, loginWithApple, isLoading, isAppleSignInAvailable } = useAuth();
  const [lastProvider, setLastProvider] = useState<'google' | 'apple' | null>(null);

  useEffect(() => {
    (async () => {
      const provider = await getLastAuthProvider();
      setLastProvider(provider);
    })();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('ログインエラー:', error);
      Alert.alert(
        'ログインエラー',
        error instanceof Error ? error.message : 'ログインに失敗しました'
      );
    }
  };

  const handleAppleLogin = async () => {
    try {
      await loginWithApple();
    } catch (error) {
      console.error('Appleログインエラー:', error);
      Alert.alert(
        'ログインエラー',
        error instanceof Error ? error.message : 'ログインに失敗しました'
      );
    }
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  return (
    <View style={styles.container}>
      {/* アプリロゴ・タイトル */}
      <View style={styles.headerSection}>
        <Text style={styles.appTitle}>MEMO SAMPLE</Text>
      </View>

      {/* ログインセクション */}
      <View style={styles.loginSection}>
        {/* 前回のログインプロバイダーがあれば表示  TODO: ログイン後、ユーザが見つからない場合もあるがその時も表示されてしまう。　ユーザーが見つからない場合はSecureStorageに保存しないようにしたほうが良いかも*/}
        {lastProvider && (
          <View style={styles.lastProviderContainer}>
            <Text style={styles.lastProviderText}>前回は{lastProvider}でログインしていました</Text>
          </View>
        )}

        {/* Googleログインボタン */}
        <GoogleLoginButton onPress={handleGoogleLogin} buttonText="Googleでログイン" />

        {/* Appleログインボタン（iOSのみ表示） */}
        {isAppleSignInAvailable && (
          <AppleLoginButton onPress={handleAppleLogin} buttonText="Appleでサインイン" />
        )}

        {/* 新規作成リンク */}
        <TouchableOpacity
          style={styles.signUpTextContainer}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          <Text style={styles.signUpText}>新規作成</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9'
  },
  headerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60
  },
  appTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#333'
  },
  loginSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  lastProviderContainer: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    marginBottom: 20
  },
  lastProviderText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center'
  },

  signUpTextContainer: {
    marginTop: 22,
    paddingVertical: 8
  },
  signUpText: {
    fontSize: 16,
    color: '#666',
    textDecorationLine: 'underline'
  }
});
