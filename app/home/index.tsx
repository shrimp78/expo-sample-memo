import { router, useFocusEffect } from 'expo-router';
import {
  Alert,
  View,
  StyleSheet,
  Text,
  Modal,
  SectionList,
  LayoutAnimation,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Button
} from 'react-native';
import { useCallback, useState } from 'react';
import { Feather, AntDesign } from '@expo/vector-icons';
import * as ItemService from '../../src/services/itemService';
import * as GroupService from '../../src/services/groupService';
import { type Item } from '../../src/components/types/item';
import { type Group } from '../../src/components/types/group';
import { ItemList } from '../../src/components/items/ItemList';

// 新規作成モーダル用
import { KeyboardAvoidingView } from '@gluestack-ui/themed';
import { ItemInputForm } from '../../src/components/items/ItemInputForm';
import * as Crypto from 'expo-crypto';

export default function HomeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  // 新規作成画面のModal用
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const toggleCreateModal = () => {
    setCreateModalVisible(!createModalVisible);
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const items = await ItemService.getAllItems();
        setItems(items);
        const groups = await GroupService.getAllGroups();
        setGroups(groups);
      };
      loadData();
    }, [])
  );

  // アイテムの新規作成
  const handleAddItemPress = () => {
    console.log('アイテムの新規作成が押されました');
    toggleCreateModal();
  };

  // アイテムの保存処理
  const handleSaveItemPress = async () => {
    console.log('アイテムの保存が押されました');

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
      const group_id = '5e0c991d-cfe6-89fa-5ce4-8db27235f3bb'; //  TODO : グループIDを選択できるようにする
      await ItemService.createItem(id, title, content, group_id);
      toggleCreateModal();
      //      await fetchItems(); TODO: ここで、アイテム一覧を更新する
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

  // アイテムの削除
  const handleDeletePress = async (itemId: string) => {
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

  const handleGroupPress = (groupId: string) => {
    console.log('グループが押されました', groupId);
  };

  // グループセクション用のデータ整形
  const sections = groups.map(group => ({
    title: group.name,
    color: group.color,
    data: items.filter(item => item.group_id === group.id)
  }));

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={[styles.groupName, { color: section.color }]}>{section.title}</Text>
            <View style={[styles.sectionHeaderBorder, { backgroundColor: section.color }]} />
          </View>
        )}
        renderItem={({ item }) => (
          <ItemList
            name={item.title}
            content={item.content}
            onPress={() => handleItemPress(item.id)}
            onDeletePress={() => handleDeletePress(item.id)}
          />
        )}
        ListFooterComponent={<View style={styles.bottomContainer} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickySectionHeadersEnabled={false}
      />
      <TouchableOpacity style={styles.floatingButton} onPress={handleAddItemPress}>
        <Feather name="plus" size={24} color="gray" />
      </TouchableOpacity>

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
                <TouchableOpacity style={styles.closeButton} onPress={toggleCreateModal}>
                  <AntDesign name="closecircleo" size={24} color="gray" />
                </TouchableOpacity>
                <View style={styles.saveButtonArea}>
                  <Button title="保存" onPress={handleSaveItemPress} />
                </View>
                <View style={styles.inputArea}>
                  <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={100}>
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
    backgroundColor: '#EFEFF4'
  },
  groupName: {
    marginTop: 30,
    marginBottom: 10,
    fontSize: 14,
    marginLeft: 14,
    fontWeight: 'bold'
  },
  bottomContainer: {
    height: 100
  },
  sectionHeader: {},
  sectionHeaderBorder: {
    flex: 1,
    height: 2
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
  // 新規作成画面のModal用
  createModalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center'
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
  inputArea: {
    marginTop: 20
  }
});
