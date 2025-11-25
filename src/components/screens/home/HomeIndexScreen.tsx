import { router, useFocusEffect, Stack } from 'expo-router';
import {
  Alert,
  View,
  StyleSheet,
  Text,
  SectionList,
  TouchableOpacity,
  GestureResponderEvent,
  Dimensions
} from 'react-native';
import { useCallback, useState, useMemo } from 'react';
import { ListItem } from '@rneui/base';
import { Entypo } from '@expo/vector-icons';

// Contexts
import { useGroups } from '@context/GroupContext';
import { useItems } from '@context/ItemContext';
import { useAuth } from '@context/AuthContext';
import { useUserPreferencesStore } from '@src/store/userPreferencesStore';
import { DEFAULT_SORT_OPTION } from '@constants/sortOptions';

// 新規作成モーダル用
import ItemCreateModal from '@screens/home/ItemCreateModal';
import HomeMenuModal from '@screens/home/HomeMenuModal';
import FloatingFolderButton from '@components/common/FloatingFolderButton';
import FloatingPlusButton from '@components/common/FloatingPlusButton';

import { changeAnnivFormat } from '@utils/annivFormatter';
import { type Item } from '@models/Item';
import { SortOptionId } from '@constants/sortOptions';

export default function HomeIndexScreen() {
  const { isLoggedIn, isLoading } = useAuth();
  const { groups, loadGroups, isHydratedFromCache: groupsHydrated } = useGroups();
  const { items, loadItems, isHydratedFromCache: itemsHydrated } = useItems();
  const itemSortOption =
    useUserPreferencesStore(state => state.itemSortOption) ?? DEFAULT_SORT_OPTION; // もしnullならデフォルト値を設定
  console.log('itemSortOption', itemSortOption);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const toggleCreateModal = () => {
    setCreateModalVisible(!createModalVisible);
  };

  // ホームメニューModal用（親制御）
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const handleMenuPress = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    setMenuAnchor({ x: pageX, y: pageY + 10 });
    setMenuVisible(true);
  };

  const handleFolderIconPress = () => {
    console.log('フォルダーのアイコンが押されました');
    router.push('/groups');
  };

  // リストのデータを都度更新するためのフック
  // ItemEditから戻ってきた時に更新するよう
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        // グループの並び順変更を即時反映するため、グループも再取得
        await Promise.all([loadItems(), loadGroups()]);
      };
      loadData();
    }, [loadItems, loadGroups])
  );

  // アイテムの新規作成
  const handleAddItemPress = () => {
    console.log('アイテムの新規作成が押されました');
    if (groups.length === 0) {
      Alert.alert(
        '注意',
        '現在グループがありません。アイテムは必ずグループに所属する必要があります。先にグループを作成してください',
        [
          {
            text: 'キャンセル',
            style: 'cancel'
          },
          { text: 'グループ作成', onPress: () => router.push('/groups') }
        ]
      );
    } else {
      toggleCreateModal();
    }
  };

  // アイテムが押された時の処理
  const handleItemPress = (itemId: string) => {
    console.log('アイテムが押されました', itemId);
    router.push({ pathname: `/items/${itemId}` });
  };

  // セクション内のアイテム並び替え
  const sortItems = (list: Item[], option: SortOptionId) => {
    const sorted = [...list];
    switch (option) {
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'anniv-asc':
        return sorted.sort((a, b) => a.anniv.toDate().getTime() - b.anniv.toDate().getTime());
      case 'anniv-desc':
        return sorted.sort((a, b) => b.anniv.toDate().getTime() - a.anniv.toDate().getTime());
      default:
        return sorted;
    }
  };

  // グループセクション用のデータ整形
  const sections = useMemo(() => {
    // グループごとのセクションを作成（アイテムがあるグループのみ）
    const groupSections = groups
      .map(group => {
        const groupItems = items.filter(item => item.group_id === group.id);
        const sortedItems = sortItems(groupItems, itemSortOption);
        return { title: group.name, color: group.color, data: sortedItems };
      })
      .filter(section => section.data.length > 0); // アイテムが0件のグループを除外

    // グループIDがないItemsを抽出
    const ungroupedItems = items.filter(item => item.group_id === null);
    const sortedUngroupedItems = sortItems(ungroupedItems, itemSortOption);

    // グループなしセクションを追加（アイテムがある場合のみ）
    if (sortedUngroupedItems.length > 0) {
      groupSections.push({
        title: 'グループなし',
        color: 'white',
        data: sortedUngroupedItems
      });
    }

    return groupSections;
  }, [groups, items, itemSortOption]);

  // 認証状態のロード中
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  // 未ログインの場合は何も表示しない（リダイレクト処理中）
  if (!isLoggedIn) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={handleMenuPress} style={styles.headerMenuButton}>
              <Entypo name="dots-three-horizontal" size={24} color="#808080" />
            </TouchableOpacity>
          )
        }}
      />
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderSectionHeader={({ section }) => (
          <View>
            <Text style={[styles.groupName, { color: section.color }]}>{section.title}</Text>
            <View style={[styles.sectionHeaderBorder, { backgroundColor: section.color }]} />
          </View>
        )}
        renderItem={({ item }) => {
          const formattedAnniv = changeAnnivFormat(item.anniv.toDate());

          return (
            <ListItem bottomDivider onPress={() => handleItemPress(item.id)}>
              <ListItem.Content>
                <ListItem.Title style={styles.listItemTitle}>{item.title}</ListItem.Title>
                <ListItem.Subtitle style={styles.ListItemSubtitle} numberOfLines={3}>
                  {item.anniv.toDate().toLocaleDateString()}
                </ListItem.Subtitle>
              </ListItem.Content>
              <View style={styles.yearsContainer}>
                <Text style={styles.yearsNumber}>{formattedAnniv.number}</Text>
                <Text style={styles.yearsLabel}>{formattedAnniv.unit}</Text>
              </View>
              <ListItem.Chevron />
            </ListItem>
          );
        }}
        ListEmptyComponent={
          // キャッシュ未ハイドレートの間は空表示を出さない
          !(itemsHydrated && groupsHydrated) ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>読み込み中...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items</Text>
            </View>
          )
        }
        ListFooterComponent={<View style={styles.bottomContainer} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickySectionHeadersEnabled={false}
      />
      <FloatingFolderButton onPress={handleFolderIconPress} />
      <FloatingPlusButton onPress={handleAddItemPress} />

      <ItemCreateModal
        visible={createModalVisible}
        onClose={toggleCreateModal}
        onSaved={async () => {
          await loadItems();
        }}
      />

      <HomeMenuModal
        visible={menuVisible}
        anchor={menuAnchor}
        onRequestClose={() => setMenuVisible(false)}
        onDeletedAllItems={async () => {
          await Promise.all([loadItems(), loadGroups()]);
        }}
      />
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
  emptyContainer: {
    flex: 1,
    minHeight: Dimensions.get('window').height * 0.7, // 画面の高さのX%
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#808080'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFEFF4'
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#808080'
  },
  listItemTitle: {
    color: '#4A5054',
    fontWeight: 'bold',
    fontSize: 20
  },
  ListItemSubtitle: {
    color: '#95A2AC',
    fontSize: 14,
    padding: 4,
    maxHeight: 100
  },
  yearsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    marginRight: 0
  },
  yearsNumber: {
    color: '#4A5054',
    fontSize: 21
  },
  yearsLabel: {
    color: '#95A2AC',
    fontSize: 12
  },
  headerMenuButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44
  }
});
