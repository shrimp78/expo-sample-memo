import { View, StyleSheet, FlatList } from 'react-native';
import { useState } from 'react';
import { Item } from '../../src/components/types/item';
import { ItemList } from '../../src/components/items/ItemList';
import { DUMMY_ITEMS } from '../../src/data/dummyItemData';

export default function ItemScreen() {
  const [items, setItems] = useState<Item[]>([]);

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ paddingBottom: 120 }}
        data={DUMMY_ITEMS}
        renderItem={({ item }) => <ItemList name={item.title} content={item.content} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efeff4'
  }
});
