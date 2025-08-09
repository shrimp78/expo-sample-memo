import { StyleSheet, View, Text, Image, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { useAuth } from '@context/AuthContext';

export default function AccountIndexScreen() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>ユーザーが見つかりません</Text>
        </View>
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
          <Pressable
            onPress={logout}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <Text style={styles.rowText}>ログアウト</Text>
          </Pressable>
          <View style={styles.rowSpacer} />
          <Pressable
            onPress={deleteAccount}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <Text style={[styles.rowText, styles.destructiveText]}>アカウント削除</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  scrollContent: {
    paddingVertical: 24
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 16
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E5E7EB'
  },
  name: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '600',
    color: '#111827'
  },
  email: {
    marginTop: 4,
    fontSize: 15,
    color: '#6B7280'
  },
  actionsGroup: {
    marginTop: 24,
    marginHorizontal: 16
  },
  row: {
    minHeight: 48,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 8
  },
  rowPressed: {
    backgroundColor: '#F3F4F6'
  },
  rowText: {
    fontSize: 16,
    color: '#111827'
  },
  destructiveText: {
    color: '#DC2626'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280'
  },
  rowSpacer: {
    height: 8
  }
});
