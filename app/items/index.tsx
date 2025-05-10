import { View, StyleSheet, FlatList, TouchableOpacity, Alert, LayoutAnimation, Modal, Text } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { router, useFocusEffect, useNavigation } from 'expo-router';
import { Entypo, Feather } from '@expo/vector-icons';
import { Item } from '../../src/components/types/item';
import { ItemList } from '../../src/components/items/ItemList';
import * as ItemService from '../../src/services/itemService';

export default function ItemScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const navigation = useNavigation();

  // Modal用
  const [modalVisible, setModalVisible] = useState(false);
  const toggleModal = () => setModalVisible(!modalVisible);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <View>
            <TouchableOpacity onPress={toggleModal}>
              <Entypo name="dots-three-horizontal" size={24} color="black" />
            </TouchableOpacity>
          </View>
        );
      }
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchItems = async () => {
        const items = await ItemService.getAllItems();
        setItems(items);
      };

      fetchItems();
    }, [])
  );

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

  // アイテムの削除
  const handleDeletePress = async (itemId: number) => {
    console.log('アイテムの削除が押されました', itemId);
    try {
      await ItemService.deleteItemById(itemId);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const updatedItems = await ItemService.getAllItems();
      setItems(updatedItems);
    } catch (e) {
      Alert.alert('エラー', '削除に失敗しました');
      throw e;
    }
  };

  const handleDeleteAllItems = async () => {
    console.log('アイテムの全削除が押されました');
    Alert.alert('全てのアイテムを削除します', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'OK',
        style: 'destructive',
        onPress: async () => {
          try {
            await ItemService.deleteAllItems();
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            const updatedItems = await ItemService.getAllItems();
            setItems(updatedItems);
          } catch (e) {
            Alert.alert('エラー', '削除に失敗しました');
            throw e;
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ paddingBottom: 120 }}
        data={items}
        renderItem={({ item }) => (
          <ItemList
            name={item.title}
            content={item.content}
            onPress={() => handleItemPress(item.id)}
            onDeletePress={() => handleDeletePress(item.id)}
          />
        )}
      />
      <TouchableOpacity style={styles.floatingButton} onPress={handleAddItemPress}>
        <Feather name="plus" size={24} color="gray" />
      </TouchableOpacity>

      <Modal transparent={true} visible={modalVisible} animationType="fade" onRequestClose={toggleModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.menuItem} onPress={toggleModal}>
              閉じる
            </Text>
            <Text style={styles.menuItem} onPress={handleDeleteAllItems}>
              アイテムを全て削除する
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efeff4'
  },
  floatingButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 40,
    elevation: 5, // Android用の影
    shadowColor: 'black', // iOS用の影
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: 30
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15
  },
  menuItem: {
    paddingVertical: 10,
    fontSize: 16,
    textAlign: 'center'
  }
});
