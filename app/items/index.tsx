import { View, StyleSheet, FlatList, Button } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Item } from '../../src/components/types/item';
import { ItemList } from '../../src/components/items/ItemList';
import { DUMMY_ITEMS } from '../../src/data/dummyItemData';

export default function ItemScreen() {
  const [items, setItems] = useState<Item[]>([]);

  // ヘッダーの追加ボタン表示
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <Feather name="edit" size={24} onPress={handleAddItemPress} />
    });
  }, []);

  // 追加ボタン押下時の処理
  const handleAddItemPress = () => {
    router.push('/items/create');
  };

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
