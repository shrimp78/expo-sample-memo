import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useAuth } from '@context/AuthContext';
import { router } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';

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
        <GoogleSigninButton
          style={[styles.googleButton, isLoading && styles.buttonDisabled]}
          size={GoogleSigninButton.Size.Standard}
          color={GoogleSigninButton.Color.Light}
          onPress={isLoading ? () => {} : handleGoogleLogin}
        />

        {/* Appleログインボタン（iOSのみ表示） */}
        {isAppleSignInAvailable && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={[styles.appleButton, isLoading && styles.buttonDisabled]}
            onPress={isLoading ? () => {} : handleAppleLogin}
          />
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
  googleButton: {
    width: '100%',
    maxWidth: 320,
    height: 60,
    marginBottom: 12,
    alignSelf: 'center'
  },
  appleButton: {
    width: '100%',
    maxWidth: 320,
    height: 60,
    marginBottom: 12,
    alignSelf: 'center'
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
