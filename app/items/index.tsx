import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useState } from 'react';
import { Item } from '../../src/components/types/item';

export default function ItemScreen() {
  const [items, setItems] = useState<Item[]>([]);

  const DUMMY_ITEMS: Item[] = [
    {
      id: '1',
      title: 'テスト1',
      description: 'テスト1の説明'
    },
    {
      id: '2',
      title: 'テスト2',
      description: 'テスト2の説明'
    },
    {
      id: '3',
      title: 'テスト3',
      description: 'テスト3の説明'
    }
  ];

  return (
    <View style={styles.container}>
      <FlatList data={DUMMY_ITEMS} renderItem={({ item }) => <Text>{item.title}</Text>} />
      <Text>ItemScreen ss</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efeff4'
  }
});
