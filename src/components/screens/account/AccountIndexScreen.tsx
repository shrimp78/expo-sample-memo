import { StyleSheet, View, Text, Image, Button } from 'react-native';
import { useAuth } from '@context/AuthContext';

export default function AccountIndexScreen() {
  const { user } = useAuth();

  if (!user) {
    return <View>ユーザーが見つかりません</View>;
  }

  const logout = () => {
    console.log('ログアウト');
  };
  const deleteAccount = () => {
    console.log('アカウント削除');
  };

  return (
    <View style={styles.container}>
      {user.picture ? ( // 後々メール＆PWでアカウント作成した場合一旦は画像無しにするためこの分岐必要そう
        <Image source={{ uri: user.picture }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]} />
      )}
      <Text>{user.name}</Text>
      <Text>{user.email}</Text>
      <Button title="ログアウト" onPress={() => logout()} />
      <Button title="アカウント削除" onPress={() => deleteAccount()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16
  },
  avatar: {
    width: 96,
    height: 96
  },
  avatarFallback: {
    backgroundColor: '#E5E7EB'
  }
});
