import { StyleSheet, Button, Alert, View } from 'react-native';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
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
  const { items } = useItems();
  const { groups: contextGroups } = useGroups();

  // Annivの状態と選択肢
  const [year, setYear] = useState<number>(2000);
  const [month, setMonth] = useState<number>(1);
  const [day, setDay] = useState<number>(1);
  const years = useMemo(() => Array.from({ length: 101 }, (_, i) => 1970 + i), []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  // 選択中の年・月の「UTC基準での」月末日数を取得
  const daysInMonth = useMemo(() => new Date(Date.UTC(year, month, 0)).getDate(), [year, month]);
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

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
        const item = await getItemById(user.id, id);
        const groups = await getAllGroupsByUserId(user.id);
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

  // ItemContextからItemを即時に初期値として反映（stale-while-revalidate）
  useEffect(() => {
    console.log('stale-while-revalidate for Item');
    if (!id) return;
    const cachedItem = items.find(item => item.id === id);
    if (cachedItem) {
      setTitle(cachedItem.title);
      setContent(cachedItem.content);
      setSelectedGroup(contextGroups.find(group => group.id === cachedItem.group_id) ?? null);
      // TODO： 後でItemに値が入るようになったら全部修正する！
      //setYear(cachedItem.anniv.toDate().getFullYear());
      //setMonth(cachedItem.anniv.toDate().getMonth() + 1);
      //setDay(cachedItem.anniv.toDate().getDate());
      setYear(2000);
      setMonth(1);
      setDay(1);
    }
  }, [id, items]);

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
      await updateItemById(user.id, id, title, content, selectedGroup?.id as string);
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
