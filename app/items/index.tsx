import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Button,
  LayoutAnimation,
  Modal,
  Text,
  TouchableWithoutFeedback
} from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { router, useFocusEffect, useNavigation } from 'expo-router';
import { Entypo, Feather, AntDesign } from '@expo/vector-icons';
import { Item } from '../../src/components/types/item';
import { ItemList } from '../../src/components/items/ItemList';
import * as ItemService from '../../src/services/itemService';

// 新規作成モーダル用
import { KeyboardAvoidingView } from '@gluestack-ui/themed';
import { ItemInputForm } from '../../src/components/items/ItemInputForm';
import * as Crypto from 'expo-crypto';

export default function ItemScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const navigation = useNavigation();

  // メニューModal用
  const [modalVisible, setModalVisible] = useState(false);
  const toggleModal = () => setModalVisible(!modalVisible);

  // 新規作成画面のModal用
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const toggleCreateModal = () => {
    setCreateModalVisible(!createModalVisible);
  };

  const fetchItems = async () => {
    // TODO: try catch を入れる
    const items = await ItemService.getAllItems();
    setItems(items);
  };

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
      fetchItems();
    }, [])
  );

  // (+)ボタン押下時の処理
  const handleAddItemPress = () => {
    console.log('追加ボタンが押されました');
    toggleCreateModal();
  };

  // 保存ボタン押下時の処理
  const handleSaveItemPress = async () => {
    console.log('保存ボタンが押されました');
    // TODO: loading画面の実装

    // バリデーション
    if (!title) {
      Alert.alert('確認', 'タイトルを入力してください');
      return;
    }
    if (!content) {
      Alert.alert('確認', 'コンテンツを入力してください');
      return;
    }

    // 保存処理
    try {
      const id = Crypto.randomUUID();
      const group_id = null; //  TODO : グループIDを選択できるようにする
      await ItemService.createItem(id, title, content, group_id);
      toggleCreateModal();
      await fetchItems();
    } catch (e) {
      Alert.alert('エラー', '保存に失敗しました');
      console.error(e);
    } finally {
      setTitle('');
      setContent('');
    }
  };

  // アイテムが押された時の処理
  const handleItemPress = (itemId: string) => {
    console.log('アイテムが押されました', itemId);
    router.push({ pathname: `/items/${itemId}` });
  };

  const handleDeleteAllItems = async () => {
    console.log('アイテムの全削除が押されました');
    Alert.alert('確認', 'ガチで全てのアイテムを削除しますか？', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'OK',
        style: 'destructive',
        onPress: async () => {
          try {
            toggleModal();
            await ItemService.deleteAllItems();
            const updatedItems: Item[] = [];
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
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <ItemList
            name={item.title}
            content={item.content}
            onPress={() => handleItemPress(item.id)}
            onDeletePress={() => handleDeletePress(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.listEmpty}>
            <Text style={styles.listEmptyText}>アイテムがありません</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleAddItemPress}
      >
        <Feather name="plus" size={24} color="gray" />
      </TouchableOpacity>

      {/* メニューモーダル */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={toggleModal}
      >
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback
              onPress={() => {
                /* Modal内でのタップで閉じないようにする */
              }}
            >
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={toggleModal}
                >
                  <AntDesign name="closecircleo" size={24} color="gray" />
                </TouchableOpacity>
                <Text style={styles.menuItem} onPress={handleDeleteAllItems}>
                  アイテムを全て削除する
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 新規作成画面のModal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={toggleCreateModal}
      >
        <TouchableWithoutFeedback onPress={toggleCreateModal}>
          <View style={styles.createModalOverlay}>
            <TouchableWithoutFeedback
              onPress={() => {
                /* Modal内でのタップで閉じないようにする */
              }}
            >
              <View style={styles.createModalContent}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={toggleCreateModal}
                >
                  <AntDesign name="closecircleo" size={24} color="gray" />
                </TouchableOpacity>
                <View style={styles.saveButtonArea}>
                  <Button title="保存" onPress={handleSaveItemPress} />
                </View>
                <View style={styles.inputArea}>
                  <KeyboardAvoidingView
                    behavior="padding"
                    keyboardVerticalOffset={100}
                  >
                    <ItemInputForm
                      title={title}
                      content={content}
                      onChangeTitle={setTitle}
                      onChangeContent={setContent}
                    />
                  </KeyboardAvoidingView>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  },
  modalContent: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5 // Android用のShadow
  },
  menuItem: {
    paddingVertical: 10,
    fontSize: 16,
    textAlign: 'center'
  },
  listEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 300 // TODO: どんな画面サイズでも自動で上下中央に寄せる方法を後で見つけたい
  },
  listEmptyText: {
    fontSize: 20,
    color: 'gray'
  },
  createModalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1,
    padding: 4
  },
  saveButtonArea: {
    position: 'absolute',
    top: 8,
    right: 12,
    padding: 4
  },
  createModalContent: {
    position: 'absolute',
    top: 80, // TODO: これ、デバイスによって違うので、デバイスの高さによって変える必要がある
    width: '96%',
    bottom: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: '#000', // iOS用
    shadowOffset: { width: 0, height: 4 }, // iOS用
    shadowOpacity: 0.3, // iOS用
    shadowRadius: 8, // iOS用
    elevation: 10 // Android用
  },
  inputArea: {
    marginTop: 20
  }
});
