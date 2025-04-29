import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Item } from '../../src/components/types/item';
import { ItemInputForm } from '../../src/components/items/ItemInputForm';
import { DUMMY_ITEMS } from '../../src/data/dummyItemData';

export default function ItemEditScreen() {
  const { id } = useLocalSearchParams();

  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    console.log('useEffect -> id', id);
    const item = DUMMY_ITEMS.find(item => item.id === Number(id));
    if (item) {
      setItem(item);
    }
    // TODO: アイテムが見つからない場合の処理を後で追加する
  }, [id]);

  return (
    <View>
      <Text>{item?.title}</Text>
      <Text>{item?.content}</Text>
    </View>
  );
}
