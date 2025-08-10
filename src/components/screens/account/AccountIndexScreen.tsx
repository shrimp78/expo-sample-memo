import { StyleSheet, View, Text, Image, SafeAreaView, ScrollView, Button } from 'react-native';
import { useAuth } from '@context/AuthContext';

export default function AccountIndexScreen() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>ユーザーが見つかりません</Text>
      </SafeAreaView>
    );
  }

  const deleteAccount = () => {
    console.log('アカウント削除');
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
          <Button title="アカウント削除" onPress={deleteAccount} color="#FF3B30" />
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
