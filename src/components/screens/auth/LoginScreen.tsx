import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
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
        <Text style={styles.appTitle}>Special Days</Text>
      </View>

      {/* ログインセクション */}
      <View style={styles.loginSection}>
        {/* Googleログインボタン */}
        <TouchableOpacity
          style={[styles.loginButton, styles.googleButton, isLoading && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          <View style={styles.buttonContent}>
            <View style={styles.googleIcon}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={[styles.buttonText, { color: '#1f1f1f' }]}>
              {isLoading ? 'ログイン中...' : 'Googleでログイン'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Appleログインボタン（iOSのみ表示） */}
        {isAppleSignInAvailable && (
          <TouchableOpacity
            style={[styles.loginButton, styles.appleButton, isLoading && styles.buttonDisabled]}
            onPress={handleAppleLogin}
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              <View style={styles.appleIcon}>
                <Text style={styles.appleIconText}></Text>
              </View>
              <Text style={[styles.buttonText, { color: '#ffffff' }]}>
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
    marginBottom: 12,
    alignSelf: 'center'
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dadce0'
  },
  appleButton: {
    backgroundColor: '#000000'
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285f4',
    justifyContent: 'center',
    alignItems: 'center'
  },
  googleIconText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  appleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  appleIconText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold'
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
