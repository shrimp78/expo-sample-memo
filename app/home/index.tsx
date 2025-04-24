import { router } from 'expo-router';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ListItem } from '@rneui/themed';

export default function HomeScreen() {
  const handleAllItemsPress = () => {
    router.push({ pathname: '/items' });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 全てのメモ */}
        <ListItem onPress={handleAllItemsPress}>
          <ListItem.Content>
            <ListItem.Title>全てのアイテム</ListItem.Title>
          </ListItem.Content>
        </ListItem>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFF4'
  },
  scrollView: {
    paddingVertical: 40
  }
});
