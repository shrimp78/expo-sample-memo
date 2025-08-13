import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useAuth } from '@context/AuthContext';

export default function LoginScreen() {
  const { loginWithGoogle, loginWithEmail, isLoading } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    try {
      await loginWithEmail(email.trim(), password);
      setIsModalVisible(false);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('メールログインエラー:', error);
      Alert.alert(
        'ログインエラー',
        error instanceof Error ? error.message : 'ログインに失敗しました'
      );
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEmail('');
    setPassword('');
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

        {/* メールログインボタン */}
        <TouchableOpacity
          style={[styles.emailLoginButton, isLoading && styles.buttonDisabled]}
          onPress={() => setIsModalVisible(true)}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>メールアドレスでログイン</Text>
        </TouchableOpacity>
      </View>

      {/* メールログインModal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>メールログイン</Text>
              <TouchableOpacity onPress={handleModalClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <TextInput
                style={styles.textInput}
                placeholder="メールアドレス"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={styles.textInput}
                placeholder="パスワード"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.modalLoginButton, isLoading && styles.buttonDisabled]}
                onPress={handleEmailLogin}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>{isLoading ? 'ログイン中...' : 'ログイン'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center'
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
  emailLoginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  closeButton: {
    padding: 8
  },
  closeButtonText: {
    fontSize: 18,
    color: '#999'
  },
  modalForm: {
    gap: 16
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9'
  },
  modalLoginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8
  }
});
