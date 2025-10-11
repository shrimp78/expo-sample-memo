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

        {/* 新規作成ボタン */}
        <TouchableOpacity
          style={[styles.signUpButton, isLoading && { opacity: 0.6 }]}
          onPress={handleSignUp}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.signUpButtonText}>新しくアカウントを作成する</Text>
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
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center'
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
    paddingHorizontal: 24,
    paddingTop: 40
  },
  lastProviderContainer: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 20
  },
  lastProviderText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center'
  },

  signUpButton: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#03a9f4',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  signUpButtonText: {
    fontSize: 15,
    color: '#262626',
    fontWeight: '600'
  }
});
