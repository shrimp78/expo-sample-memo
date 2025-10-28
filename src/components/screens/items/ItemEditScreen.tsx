import { StyleSheet, Alert, View } from 'react-native';
import { Button } from '@rneui/base';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { KeyboardAvoidingView } from '@gluestack-ui/themed';
import { updateItemById } from '@services/itemService';
import { type Group } from '@models/Group';
import ItemInputForm from '@components/common/ItemInputForm';
import GroupSelectModal from '@components/common/GroupSelectModal';
import { useAuthenticatedUser } from '@context/AuthContext';
import { useItems } from '@context/ItemContext';
import { useGroups } from '@context/GroupContext';
import { Timestamp } from 'firebase/firestore';
import { deleteItemById } from '@services/itemService';

export default function ItemEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const user = useAuthenticatedUser();
  // タイトルと内容の状態
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [groups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const { items, setItems } = useItems();
  const { groups: contextGroups } = useGroups(); // TODO: なんでこれだけType名入ってる？

  // Annivの状態と選択肢
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [day, setDay] = useState<number>(1);

  // グループ選択画面のModal用
  const [groupModalVisible, setGroupModalVisible] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    const cachedItem = items.find(item => item.id === id);
    if (cachedItem) {
      setTitle(cachedItem.title);
      setContent(cachedItem.content ?? '');
      setSelectedGroup(contextGroups.find(group => group.id === cachedItem.group_id) ?? null);
      setYear(cachedItem.anniv.toDate().getFullYear());
      setMonth(cachedItem.anniv.toDate().getMonth() + 1);
      setDay(cachedItem.anniv.toDate().getDate());
    } else {
      // TODO : キャッシュにない場合の処理を追加する
    }
  }, [id, items]);

  // 保存ボタン押下時の処理
  const handleSaveItemPress = useCallback(async () => {
    // Validation
    if (!title) {
      Alert.alert('確認', 'タイトルを入力してください');
      return;
    }
    // Annivの変換
    // 選択日付のUTC0時を作成して、Timestampに変換
    console.log(`year: ${year}, month: ${month}, day: ${day}`);
    const utcMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const anniv = Timestamp.fromDate(utcMidnight);
    // Optimistic update: 画面遷移前にItemContextを更新して即時反映
    const nextItems = items.map(item =>
      item.id === id
        ? { ...item, title, content, group_id: selectedGroup ? selectedGroup.id : null, anniv }
        : item
    );
    setItems(nextItems);
    // 非同期で永続化（待たない）
    void updateItemById(user.id, id, title, content, selectedGroup?.id as string, anniv);
    router.back();
  }, [user.id, id, title, content, selectedGroup, year, month, day, items, setItems]);

  // TitleとContentの変更を監視
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <Button title="保存" onPress={handleSaveItemPress} />;
      }
    });
  }, [handleSaveItemPress, navigation]);

  // 削除ボタン押下時の処理
  const handleDeleteItemPress = () => {
    Alert.alert('確認', '削除しますが、よろしいですか？', [
      {
        text: 'キャンセル',
        style: 'cancel'
      },
      { text: '削除', onPress: () => deleteItem() }
    ]);
  };

  const deleteItem = async () => {
    console.log('アイテムの削除が押されました', id);
    try {
      // Optimistic update: ItemContextを即時反映
      const nextItems = items.filter(item => item.id !== id);
      setItems(nextItems);
      // 非同期で永続化（待たない）
      void deleteItemById(user.id, id);
      router.back();
    } catch (e) {
      Alert.alert('エラー', '削除に失敗しました');
      throw e;
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
          onSelectGroup={() => setGroupModalVisible(true)}
          selectedGroup={selectedGroup}
          year={year}
          month={month}
          day={day}
          setYear={setYear}
          setMonth={setMonth}
          setDay={setDay}
          autoFocus={false}
        />
      </KeyboardAvoidingView>
      {/* 削除ボタン ※ここにあるのはキモいが、あとあとメニューを増やして下の方に押し込められるので一旦OK */}
      <View style={styles.deleteButtonContainer}>
        <Button
          title="削除"
          titleStyle={styles.deleteButtonText}
          buttonStyle={styles.deleteButton}
          onPress={handleDeleteItemPress}
        />
      </View>

      {/* グループ選択Modal（ItemCreateModalの内部） */}
      {groupModalVisible && (
        <GroupSelectModal
          toggleGroupModal={() => setGroupModalVisible(false)}
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
    padding: 16,
    marginBottom: 16
  },
  deleteButtonContainer: {
    marginTop: 16,
    alignItems: 'center'
  },
  deleteButtonText: {
    color: '#ff0000'
  },
  deleteButton: {
    backgroundColor: '#ffffff'
  }
});
