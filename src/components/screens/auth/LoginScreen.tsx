import { StyleSheet, Text, View, TouchableOpacity, Alert, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { router } from 'expo-router';
import { getLastAuthProvider } from '@services/secureStore';

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
        <Text style={styles.appTitle}>Special Days</Text>
      </View>

      {/* ログインセクション */}
      <View style={styles.loginSection}>
        {/* 前回のログインプロバイダーがあれば表示  TODO: ログイン後、ユーザが見つからない場合もあるがその時も表示されてしまう。　ユーザーが見つからない場合はSecureStorageに保存しないようにしたほうが良いかも*/}
        {lastProvider && (
          <View>
            <Text>前回は{lastProvider}でログインしていました</Text>
          </View>
        )}

        {/* Googleログインボタン */}
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          <View style={styles.buttonContent}>
            <Image
              source={require('../../../../assets/images/buttons/google-logo.png')}
              style={styles.logoIcon}
              resizeMode="contain"
            />
            <Text style={styles.buttonText}>
              {isLoading ? 'ログイン中...' : 'Googleでログイン'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Appleログインボタン（iOSのみ表示） */}
        {isAppleSignInAvailable && (
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
            onPress={handleAppleLogin}
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              <Image
                source={require('../../../../assets/images/buttons/apple-logo.png')}
                style={styles.logoIcon}
                resizeMode="contain"
              />
              <Text style={styles.buttonText}>
                {isLoading ? 'ログイン中...' : 'Appleでサインイン'}
              </Text>
            </View>
          </TouchableOpacity>
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
  // 共通のログインボタンスタイル
  loginButton: {
    width: '100%',
    maxWidth: 320,
    height: 56,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dadce0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    alignSelf: 'center'
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 20
  },
  logoIcon: {
    width: 26,
    height: 26
  },
  buttonDisabled: {
    opacity: 0.6
  },

  signUpTextContainer: {
    marginTop: 32,
    paddingVertical: 8
  },
  signUpText: {
    fontSize: 16,
    color: '#666',
    textDecorationLine: 'underline'
  }
});
