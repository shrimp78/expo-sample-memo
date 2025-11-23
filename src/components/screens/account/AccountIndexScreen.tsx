import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useAuth, useAuthenticatedUser } from '@context/AuthContext';
import { Feather } from '@expo/vector-icons';

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

  const MenuRow = ({
    icon,
    label,
    onPress,
    color = '#1F2937',
    iconColor = '#4B5563',
    isDestructive = false,
    showChevron = true
  }: {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    onPress: () => void;
    color?: string;
    iconColor?: string;
    isDestructive?: boolean;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, isDestructive && styles.destructiveIconContainer]}>
        <Feather name={icon} size={20} color={isDestructive ? '#EF4444' : iconColor} />
      </View>
      <Text style={[styles.menuLabel, { color: isDestructive ? '#EF4444' : color }]}>{label}</Text>
      {showChevron && !isDestructive && (
        <Feather name="chevron-right" size={20} color="#D1D5DB" style={styles.chevron} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* プロフィールヘッダー */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {user.picture ? (
              <Image source={{ uri: user.picture }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* アクションメニュー */}
        <View style={styles.section}>
          <View style={styles.menuGroup}>
            <MenuRow
              icon="log-out"
              label="ログアウト"
              onPress={() => {
                Alert.alert('ログアウト', 'ログアウトしてもよろしいですか？', [
                  {
                    text: 'キャンセル',
                    style: 'cancel'
                  },
                  {
                    text: 'ログアウト',
                    style: 'destructive',
                    onPress: logout
                  }
                ]);
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.menuGroup}>
            <MenuRow
              icon="trash-2"
              label="アカウント削除"
              onPress={handleDeleteAccount}
              isDestructive={true}
              showChevron={false}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6' // 明るいグレー背景
  },
  scrollContent: {
    paddingBottom: 40
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#F3F4F6'
  },
  avatarContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF'
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF'
  },
  avatarPlaceholderText: {
    fontSize: 40,
    fontWeight: '600',
    color: '#9CA3AF'
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center'
  },
  email: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center'
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  destructiveIconContainer: {
    backgroundColor: '#FEE2E2'
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937'
  },
  chevron: {
    opacity: 0.5
  }
});
