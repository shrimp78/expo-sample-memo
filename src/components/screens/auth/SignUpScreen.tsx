import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@context/AuthContext';

export default function SignUpScreen() {
  const { signUpWithGoogle, signUpWithApple, isLoading, isAppleSignInAvailable } = useAuth();

  const handleGoogleSignUp = async () => {
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
        <TouchableOpacity
          style={[
            styles.signUpButton,
            styles.googleSignUpButton,
            isLoading && styles.buttonDisabled
          ]}
          onPress={handleGoogleSignUp}
          disabled={isLoading}
        >
          <View style={styles.buttonContent}>
            {/* Google アイコン */}
            <View style={styles.googleIcon}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={[styles.signUpButtonText, styles.googleButtonText]}>
              {isLoading ? '登録中...' : 'Googleで始める'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Appleで始めるボタン（iOSのみ表示） */}
        {isAppleSignInAvailable && (
          <TouchableOpacity
            style={[
              styles.signUpButton,
              styles.appleSignUpButton,
              isLoading && styles.buttonDisabled
            ]}
            onPress={handleAppleSignUp}
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              {/* Apple アイコン */}
              <View style={styles.appleIcon}>
                <Text style={styles.appleIconText}></Text>
              </View>
              <Text style={[styles.signUpButtonText, styles.appleButtonText]}>
                {isLoading ? '登録中...' : 'Appleで始める'}
              </Text>
            </View>
          </TouchableOpacity>
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
  },
  // 共通の新規作成ボタンスタイル
  signUpButton: {
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
  googleSignUpButton: {
    backgroundColor: '#4285f4',
    borderWidth: 1,
    borderColor: '#4285f4',
    marginBottom: 12
  },
  appleSignUpButton: {
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
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  googleIconText: {
    color: '#4285f4',
    fontSize: 14,
    fontWeight: 'bold'
  },
  // 統一された新規作成ボタンテキストスタイル
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  googleButtonText: {
    color: '#ffffff'
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
  }
});
