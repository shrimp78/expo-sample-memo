import { View, StyleSheet, FlatList, Button } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Item } from '../../src/components/types/item';
import { ItemList } from '../../src/components/items/ItemList';
import * as ItemService from '../../src/services/itemService';

export default function ItemScreen() {
  const [items, setItems] = useState<Item[]>([]);

  // ヘッダーの追加ボタン表示
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <Feather name="edit" size={24} onPress={handleAddItemPress} />
    });
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      const items = await ItemService.getAllItems();
      setItems(items);
    };

    fetchItems();
  }, []);

  // 追加ボタン押下時の処理
  const handleAddItemPress = () => {
    console.log('追加ボタンが押されました');
    router.push('/items/create');
  };

  // アイテムが押された時の処理
  const handleItemPress = (itemId: number) => {
    console.log('アイテムが押されました', itemId);
    router.push({ pathname: `/items/${itemId}` });
  };

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ paddingBottom: 120 }}
        data={items}
        renderItem={({ item }) => <ItemList name={item.title} content={item.content} onPress={() => handleItemPress(item.id)} />}
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
