import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useAuth } from '@context/AuthContext';

const LoginScreen: React.FC = () => {
  const { loginWithGoogle, isLoading } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('ログインエラー:', error);
      // TODO: エラーハンドリング（アラート表示など）
    }
  };

  return (
    <View style={styles.container}>
      {/* アプリロゴ・タイトル */}
      <View style={styles.headerSection}>
        <Text style={styles.appTitle}>Sample App</Text>
      </View>

      {/* ログインセクション */}
      <View style={styles.loginSection}>
        <Text style={styles.descriptionText}>ログインしてください</Text>

        {/* Googleログインボタン */}
        <TouchableOpacity
          style={[styles.googleLoginButton, isLoading && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          <View style={styles.buttonContent}>
            {/* Google アイコン（仮のアイコン） */}
            <View style={styles.googleIcon}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={styles.buttonText}>{isLoading ? 'ログイン中...' : 'Googleログイン'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* フッター */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ログインすることで、利用規約とプライバシーポリシーに同意したものとみなします
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 24,
    justifyContent: 'space-between'
  },
  headerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60
  },
  appTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40
  },
  loginSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24
  },
  googleLoginButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
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
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18
  }
});

export default LoginScreen;
