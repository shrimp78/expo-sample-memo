import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useAuth } from '@context/AuthContext';
import { router } from 'expo-router';

export default function LoginScreen() {
  const { loginWithGoogle, loginWithApple, isLoading, isAppleSignInAvailable } = useAuth();

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
        <Text style={styles.appTitle}>EXPO SAMPLE</Text>
      </View>

      {/* ログインセクション */}
      <View style={styles.loginSection}>
        {/* Googleログインボタン */}
        <TouchableOpacity
          style={[styles.loginButton, styles.googleLoginButton, isLoading && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          <View style={styles.buttonContent}>
            {/* Google アイコン（仮のアイコン） */}
            <View style={styles.googleIcon}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={[styles.loginButtonText, styles.googleButtonText]}>
              {isLoading ? 'ログイン中...' : 'Googleログイン'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Appleログインボタン（iOSのみ表示） */}
        {isAppleSignInAvailable && (
          <TouchableOpacity
            style={[
              styles.loginButton,
              styles.appleLoginButton,
              isLoading && styles.buttonDisabled
            ]}
            onPress={handleAppleLogin}
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              {/* Apple アイコン */}
              <View style={styles.appleIcon}>
                <Text style={styles.appleIconText}></Text>
              </View>
              <Text style={[styles.loginButtonText, styles.appleButtonText]}>
                {isLoading ? 'ログイン中...' : 'Appleログイン'}
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
    maxWidth: 280,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center'
  },
  googleLoginButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12
  },
  appleLoginButton: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 12
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  googleIconText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  // 統一されたログインボタンテキストスタイル
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  googleButtonText: {
    color: '#333'
  },
  appleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  appleIconText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold'
  },
  appleButtonText: {
    color: '#ffffff'
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
