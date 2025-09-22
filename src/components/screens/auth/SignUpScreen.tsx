import React from 'react';
import { StyleSheet, Text, View, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '@context/AuthContext';
import { GoogleLoginButton, AppleLoginButton } from '@components/screens/auth/LoginButton';

export default function SignUpScreen() {
  const { signUpWithGoogle, signUpWithApple, isAppleSignInAvailable, isLoading } = useAuth();

  const handleGoogleSignUp = async () => {
    if (isLoading) return;
    try {
      await signUpWithGoogle();
      // 成功した場合はホーム画面に遷移（AuthContextでの処理後）
    } catch (error) {
      console.error('新規登録エラー:', error);

      // 既存ユーザーの場合の処理
      if (error instanceof Error && error.message.includes('既にこのユーザーが存在します')) {
        Alert.alert('既にこのユーザーが存在します', '', [
          {
            text: '確認'
          }
        ]);
      } else {
        Alert.alert(
          '新規登録エラー',
          error instanceof Error ? error.message : '新規登録に失敗しました'
        );
      }
    }
  };

  const handleAppleSignUp = async () => {
    if (isLoading) return;
    try {
      await signUpWithApple();
      // 成功した場合はホーム画面に遷移（AuthContextでの処理後）
    } catch (error) {
      console.error('Apple新規登録エラー:', error);

      // 既存ユーザーの場合の処理
      if (error instanceof Error && error.message.includes('既にこのユーザーが存在します')) {
        Alert.alert('既にこのユーザーが存在します', '', [
          {
            text: '確認'
          }
        ]);
      } else {
        Alert.alert(
          '新規登録エラー',
          error instanceof Error ? error.message : '新規登録に失敗しました'
        );
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#999" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ヘッダーセクション */}
      <View style={styles.headerSection}>
        <Text style={styles.pageTitle}>アカウント新規作成</Text>
        <Text style={styles.subtitle}>GoogleまたはAppleアカウントでアプリを始めましょう</Text>
      </View>

      {/* 新規作成セクション */}
      <View style={styles.signUpSection}>
        {/* Googleで始めるボタン */}
        <GoogleLoginButton onPress={handleGoogleSignUp} buttonText="Googleではじめる" />

        {/* Appleで始めるボタン（iOSのみ表示） */}
        {isAppleSignInAvailable && (
          <AppleLoginButton onPress={handleAppleSignUp} buttonText="Appleではじめる" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9'
  },
  headerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 24
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24
  },
  signUpSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  }
});
