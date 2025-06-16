import { StyleSheet, Button, Alert, View } from 'react-native';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView } from '@gluestack-ui/themed';
import { ItemInputForm } from '../../src/components/items/ItemInputForm';
import * as ItemService from '../../src/services/itemService';
import * as GroupService from '../../src/services/groupService';
import { type Group } from '../../src/components/types/group';
import GroupSelectModal from '../../src/components/groups/groupSelectModal';

export default function ItemEditScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  // タイトルと内容の状態
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // グループ選択画面のModal用
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const toggleGroupModal = () => {
    setGroupModalVisible(!groupModalVisible);
  };
  const onSelectGroup = () => {
    toggleGroupModal();
  };

  // Itemの取得
  useEffect(() => {
    console.log('useEffect -> id', id);

    const fetchItem = async () => {
      try {
        const item = await ItemService.getItemById(id as string);
        const groups = await GroupService.getAllGroups();
        setGroups(groups);
        if (item) {
          setTitle(item.title);
          setContent(item.content);
          setSelectedGroup(groups.find(group => group.id === item.group_id) ?? null);
        }
      } catch (error) {
        console.error('Itemの取得に失敗しました', error);
      }
    };
    fetchItem();
  }, [id]);

  // TitleとContentの変更を監視
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <Button title="保存" onPress={handleSaveItemPress} />;
      }
    });
  }, [title, content, selectedGroup]);

  // 保存ボタン押下時の処理
  const handleSaveItemPress = async () => {
    // Validation
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
      await ItemService.updateItemById(id as string, title, content, selectedGroup?.id ?? null);
      router.back();
    } catch (e) {
      Alert.alert('エラー', '保存に失敗しました', [{ text: 'OK', onPress: () => router.back() }]);
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={100}>
        <ItemInputForm
          title={title}
          content={content}
          onChangeTitle={setTitle}
          onChangeContent={setContent}
          onSelectGroup={onSelectGroup}
          selectedGroup={selectedGroup}
        />
      </KeyboardAvoidingView>

      {/* グループ選択Modal（ItemCreateModalの内部） */}
      {groupModalVisible && (
        <GroupSelectModal
          toggleGroupModal={toggleGroupModal}
          groups={groups}
          setSelectedGroup={setSelectedGroup}
          selectedGroup={selectedGroup}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  }
});
