import { StyleSheet, Button, Alert, View } from 'react-native';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { KeyboardAvoidingView } from '@gluestack-ui/themed';
import { getItemById, updateItemById } from '@services/itemService';
import { getAllGroupsByUserId } from '@services/groupService';
import { type Group } from '@models/Group';
import ItemInputForm from '@components/common/ItemInputForm';
import GroupSelectModal from '@components/common/GroupSelectModal';
import { useAuthenticatedUser } from '@context/AuthContext';
import { useItems } from '@context/ItemContext';
import { useGroups } from '@context/GroupContext';
import { Timestamp } from 'firebase/firestore';

export default function ItemEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const user = useAuthenticatedUser();
  // タイトルと内容の状態
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const { items, setItems } = useItems();
  const { groups: contextGroups } = useGroups(); // TODO: なんでこれだけType名入ってる？

  // Annivの状態と選択肢
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [day, setDay] = useState<number>(1);
  const years = useMemo(() => Array.from({ length: 101 }, (_, i) => 1970 + i), []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  // 選択中の年・月の「UTC基準での」月末日数を取得
  const daysInMonth = useMemo(() => new Date(Date.UTC(year, month, 0)).getUTCDate(), [year, month]);
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  // グループ選択画面のModal用
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const toggleGroupModal = () => {
    setGroupModalVisible(!groupModalVisible);
  };
  const onSelectGroup = () => {
    toggleGroupModal();
  };

  // ItemContextからItemを即時に初期値として反映（stale-while-revalidate）
  useEffect(() => {
    console.log('stale-while-revalidate for Item');
    if (!id) return;
    const cachedItem = items.find(item => item.id === id);
    if (cachedItem) {
      console.log('loadItem from cache');
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
      item.id === id ? { ...item, title, content, group_id: selectedGroup ? selectedGroup.id : null, anniv } : item
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
          years={years}
          months={months}
          days={days}
          year={year}
          month={month}
          day={day}
          setYear={setYear}
          setMonth={setMonth}
          setDay={setDay}
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
