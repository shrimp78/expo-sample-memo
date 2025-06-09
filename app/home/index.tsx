import { router, useFocusEffect } from 'expo-router';
import {
  Alert,
  View,
  StyleSheet,
  Text,
  SectionList,
  LayoutAnimation,
  TouchableOpacity,
  Modal
} from 'react-native';
import { useCallback, useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import * as ItemService from '../../src/services/itemService';
import * as GroupService from '../../src/services/groupService';
import { type Item } from '../../src/components/types/item';
import { type Group } from '../../src/components/types/group';
import { ItemList } from '../../src/components/items/ItemList';

// 新規作成モーダル用
import * as Crypto from 'expo-crypto';
import { ItemCreateModal } from '../../src/components/items/ItemCreateModal';

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

  // グループ選択画面のModal用
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const toggleGroupModal = () => {
    setCreateModalVisible(!createModalVisible);
    setGroupModalVisible(!groupModalVisible);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // デバッグ用: groupModalVisibleの状態変化を監視
  useEffect(() => {
    console.log('groupModalVisible state changed:', groupModalVisible);
  }, [groupModalVisible]);

  const loadData = async () => {
    const items = await ItemService.getAllItems();
    setItems(items);
    const groups = await GroupService.getAllGroups();
    setGroups(groups);
  };

  // アイテムの新規作成
  const handleAddItemPress = () => {
    console.log('アイテムの新規作成が押されました');
    toggleCreateModal();
  };

  // グループ選択処理
  const handleSelectGroup = () => {
    console.log('グループ選択が押されました');
    toggleGroupModal();
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
      await loadData();
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

      <ItemCreateModal
        visible={createModalVisible}
        toggleCreateModal={toggleCreateModal}
        onSave={handleSaveItemPress}
        onChangeTitle={setTitle}
        onChangeContent={setContent}
        onSelectGroup={handleSelectGroup}
        title={title}
        content={content}
      />

      <Modal
        visible={groupModalVisible}
        onRequestClose={() => {
          console.log('Modal onRequestClose called');
          toggleGroupModal();
        }}
        transparent={true}
      >
        <View style={styles.groupModalOverlay}>
          <View style={styles.groupModalContent}>
            <Text style={styles.groupModalTitle}>グループ選択</Text>
            <TouchableOpacity style={styles.closeModalButton} onPress={toggleGroupModal}>
              <Text style={styles.closeModalButtonText}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFF4'
  },
  bottomContainer: {
    height: 100
  },
  sectionHeader: {},
  groupName: {
    marginTop: 30,
    marginBottom: 10,
    fontSize: 24,
    marginLeft: 14,
    fontWeight: 'bold'
  },
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
  groupModalOverlay: {
    // TODO: あとで全部消す（グループ選択画面デバッグ用スタイル）
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  groupModalContent: {
    backgroundColor: 'red',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center'
  },
  groupModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20
  },
  closeModalButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5
  },
  closeModalButtonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});
