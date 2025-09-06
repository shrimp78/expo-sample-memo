import { StyleSheet, Button, Alert, View } from 'react-native';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView } from '@gluestack-ui/themed';
import {
  getAllUserGroupsFromFirestore,
  updateItemByIdFromFirestore,
  getItemByIdFromFirestore
} from '@services/firestoreService';
import { type Group } from '@models/Group';
import ItemInputForm from '@components/common/ItemInputForm';
import GroupSelectModal from '@components/common/GroupSelectModal';
import { useAuth, useAuthenticatedUser } from '@context/AuthContext';

export default function ItemEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const user = useAuthenticatedUser();
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
    const fetchItem = async () => {
      try {
        const item = await getItemByIdFromFirestore(user.id, id);
        const groups = await getAllUserGroupsFromFirestore(user.id);
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
      await updateItemByIdFromFirestore(user.id, id, title, content, selectedGroup?.id as string);
      router.back();
    } catch (e) {
      Alert.alert('エラー', '保存に失敗しました', [{ text: 'OK', onPress: () => router.back() }]);
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={100} style={{ flex: 1 }}>
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
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16
  }
});
