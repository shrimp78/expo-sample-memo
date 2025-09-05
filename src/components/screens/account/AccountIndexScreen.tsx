import {
  StyleSheet,
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  Button,
  Alert
} from 'react-native';
import { useAuth, useAuthenticatedUser } from '@context/AuthContext';

export default function AccountIndexScreen() {
  const { logout, deleteAccount } = useAuth();
  const user = useAuthenticatedUser();

  const handleDeleteAccount = () => {
    try {
      Alert.alert(
        'アカウント削除',
        'アカウントを削除すると、全てのデータが失われます。この操作は取り消せません。本当に削除しますか？\n\nなお、安全のためログイン認証の再チェックが必要です。「削除する」ボタンを押すとログインダイアログが出現します。',
        [
          {
            text: 'キャンセル',
            style: 'cancel'
          },
          {
            text: '削除する',
            style: 'destructive',
            onPress: async () => {
              await deleteAccount();
            }
          }
        ]
      );
    } catch (error) {
      console.error('アカウント削除エラー', error);
      Alert.alert('アカウント削除エラー', 'アカウント削除に失敗しました。再度お試しください。');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          {user.picture ? (
            <Image source={{ uri: user.picture }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.actionsGroup}>
          <Button title="ログアウト" onPress={logout} color="#007AFF" />
          <Button title="アカウント削除" onPress={handleDeleteAccount} color="#FF3B30" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 黄金比に基づいたデザイン定数
const PHI = 1.618; // 黄金比
const BASE_UNIT = 16; // 基本単位（16px）

// 黄金比を使った計算値
const AVATAR_SIZE = BASE_UNIT * PHI * PHI * PHI; // ≈ 67.5 → 68
const NAME_FONT_SIZE = BASE_UNIT * PHI; // ≈ 25.9 → 26
const EMAIL_FONT_SIZE = BASE_UNIT; // 16
const LARGE_SPACING = BASE_UNIT * PHI * PHI; // ≈ 41.9 → 42
const MEDIUM_SPACING = BASE_UNIT * PHI; // ≈ 25.9 → 26
const SMALL_SPACING = BASE_UNIT; // 16
const CONTAINER_PADDING = BASE_UNIT * PHI; // ≈ 25.9 → 26

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  scrollContent: {
    paddingVertical: CONTAINER_PADDING
  },
  header: {
    alignItems: 'center',
    paddingTop: LARGE_SPACING * PHI, // ≈ 67.9 → 68
    paddingHorizontal: CONTAINER_PADDING
  },
  avatarImage: {
    width: AVATAR_SIZE * PHI, // ≈ 110
    height: AVATAR_SIZE * PHI,
    borderRadius: (AVATAR_SIZE * PHI) / 2
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE * PHI,
    height: AVATAR_SIZE * PHI,
    borderRadius: (AVATAR_SIZE * PHI) / 2,
    backgroundColor: '#E5E7EB'
  },
  name: {
    marginTop: LARGE_SPACING,
    fontSize: NAME_FONT_SIZE,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center'
  },
  email: {
    marginTop: SMALL_SPACING,
    fontSize: EMAIL_FONT_SIZE,
    color: '#6B7280',
    textAlign: 'center'
  },
  actionsGroup: {
    marginTop: LARGE_SPACING * PHI, // ≈ 67.9 → 68
    paddingHorizontal: CONTAINER_PADDING,
    alignItems: 'center',
    gap: MEDIUM_SPACING
  }
});
