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
    paddingTop: 50,
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
    marginTop: 24,
    fontSize: 30,
    fontWeight: '600',
    color: '#111827'
  },
  email: {
    marginTop: 12,
    fontSize: 20,
    color: '#6B7280'
  },
  actionsGroup: {
    marginTop: 34,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 16
  }
});
