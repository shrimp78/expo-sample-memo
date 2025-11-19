import { StyleSheet, Alert, View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import { useEffect, useState, useCallback, useRef } from 'react';
import { KeyboardAvoidingView } from '@gluestack-ui/themed';
import { updateItemById, getItemById } from '@services/itemService';
import { type Group } from '@models/Group';
import ItemInputForm from '@components/common/ItemInputForm';
import GroupSelectModal from '@components/common/GroupSelectModal';
import { useAuthenticatedUser } from '@context/AuthContext';
import { useItems } from '@context/ItemContext';
import { useGroups } from '@context/GroupContext';
import { Timestamp } from 'firebase/firestore';
import { deleteItemById } from '@services/itemService';
import { Feather } from '@expo/vector-icons';

export default function ItemEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const user = useAuthenticatedUser();
  // タイトルと内容の状態
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const { items, setItems, isHydratedFromCache } = useItems();
  const { groups } = useGroups();

  // Annivの状態と選択肢
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [day, setDay] = useState<number>(1);

  // グループ選択画面のModal用
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  // キャッシュに存在しない場合にFirestoreへ単体取得する際のローディング状態
  const [isRemoteFetching, setIsRemoteFetching] = useState(false);
  // 同じアイテムIDに対して複数回リクエストを送らないためのフラグ
  const hasFetchedFromRemote = useRef(false);

  useEffect(() => {
    hasFetchedFromRemote.current = false;
  }, [id]);

  // Itemデータを入力フォームへ反映する共通処理
  const applyItemToForm = useCallback(
    (item: (typeof items)[number]) => {
      setTitle(item.title);
      setContent(item.content ?? '');
      setSelectedGroup(groups.find(group => group.id === item.group_id) ?? null);
      setYear(item.anniv.toDate().getFullYear());
      setMonth(item.anniv.toDate().getMonth() + 1);
      setDay(item.anniv.toDate().getDate());
    },
    [groups]
  );

  // 編集対象アイテムをキャッシュ→Firestoreの順で解決する
  useEffect(() => {
    // URLパラメータにIDが無い場合はなにもできないので早期リターン
    if (!id) {
      return;
    }

    // まだキャッシュに残っている場合はそれをフォームへ適用するだけでOK
    const cachedItem = items.find(item => item.id === id);
    if (cachedItem) {
      applyItemToForm(cachedItem);
      return;
    }

    // キャッシュがまだ復元されていない段階ではremote fetchしない。
    // また、既に試行済みであれば再実行を避けて無限ループを防ぐ。
    if (!isHydratedFromCache || hasFetchedFromRemote.current) {
      return;
    }

    // ここまで来たらFirestoreへフォールバックする準備
    hasFetchedFromRemote.current = true;
    setIsRemoteFetching(true);

    (async () => {
      try {
        const fetchedItem = await getItemById(user.id, id);

        if (fetchedItem) {
          // Firestoreから取得できたデータをコンテキスト／キャッシュにも反映
          // 次回以降の画面表示でも使えるようにする
          const exists = items.some(item => item.id === fetchedItem.id);
          const nextItems = exists
            ? items.map(item => (item.id === fetchedItem.id ? fetchedItem : item))
            : [...items, fetchedItem];

          // setItemsはキャッシュとコンテキストを同時に更新してくれる
          await setItems(nextItems);
          applyItemToForm(fetchedItem);
        } else {
          // Firestoreに存在しない場合は削除済み等の可能性が高いため通知して戻る
          Alert.alert('確認', '対象のアイテムが見つかりませんでした', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch item from Firestore', error);
        // 通信失敗時はエラーメッセージのみ表示し、次回マウント時に再試行できるようフラグを戻す
        Alert.alert('エラー', 'アイテムの取得に失敗しました');
        hasFetchedFromRemote.current = false;
      } finally {
        setIsRemoteFetching(false);
      }
    })();
  }, [id, items, applyItemToForm, isHydratedFromCache, setItems, user.id]);

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
        return (
          <TouchableOpacity
            accessibilityLabel="アイテムを保存する"
            onPress={handleSaveItemPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.headerSaveButton}
          >
            <Text style={styles.headerSaveButtonText}>保存</Text>
          </TouchableOpacity>
        );
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

  if (!isHydratedFromCache || isRemoteFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={100}>
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
        {/* 削除ボタン */}
        <View style={styles.deleteButtonContainer}>
          <TouchableOpacity
            accessibilityLabel="アイテムを削除する"
            accessibilityRole="button"
            activeOpacity={0.8}
            onPress={handleDeleteItemPress}
            style={styles.deleteButton}
          >
            <Feather name="trash-2" size={18} color="#ff453a" style={styles.deleteButtonIcon} />
            <Text style={styles.deleteButtonText}>削除</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

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
    marginTop: 8,
    alignItems: 'center'
  },
  deleteButtonText: {
    color: '#ff453a',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2
  },
  deleteButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.08)',
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
    shadowColor: '#ff453a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12
  },
  deleteButtonIcon: {
    marginRight: 8
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff'
  },
  headerSaveButton: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  headerSaveButtonText: {
    color: '#007aff',
    fontSize: 16,
    fontWeight: '600'
  }
});
