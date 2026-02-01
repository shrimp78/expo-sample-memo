import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useState, useCallback } from 'react';
import { type Group } from '@models/Group';
import FloatingPlusButton from '@components/common/FloatingPlusButton';
import GroupCreateModal from '@screens/groups/GroupCreateModal';
import { useFocusEffect } from 'expo-router';
import RenderGroupItem from '@screens/groups/RenderGroupItem';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGroups } from '@context/GroupContext';
import {
  deleteGroupByIdWithItems,
  calculateGroupNewPosition,
  updateGroupPosition
} from '@services/groupService';
import { countItemsByGroupId } from '@services/itemService';
import { useAuthenticatedUser } from '@context/AuthContext';
import { DATA_LIMITS } from '@constants/dataLimits';

export default function GroupIndexScreen() {
  const { groups, loadGroups, setGroups } = useGroups();
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [groupCreateModalVisible, setGroupCreateModalVisible] = useState(false);
  const user = useAuthenticatedUser();

  //  画面がフォーカスされたときにグループを再取得;
  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [loadGroups])
  );

  // Pull to refresh の処理
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadGroups();
    } finally {
      setRefreshing(false);
    }
  }, [loadGroups]);

  // ドラッグ操作時の処理
  const handleDragEnd = async ({ data, from, to }: { data: Group[]; from: number; to: number }) => {
    if (from === to) return;
    try {
      // dataをそのまま使用（DraggableFlatListが既に順序を変更済み）

      // 移動したグループの新しいposition値を計算してデータベースに保存
      const movedGroup = data[to];
      const newPosition = calculateGroupNewPosition(to, data);

      // データベースのposition値を更新
      await updateGroupPosition(user.id, movedGroup.id, newPosition);

      // position値をローカルstateにも反映
      const updatedData = [...data];
      updatedData[to] = { ...movedGroup, position: newPosition };
      // Contextのgroupsを即時更新（キャッシュも更新される）
      await setGroups(updatedData);
    } catch (error) {
      console.error('Error updating group position:', error);
      // エラーの場合は元の状態に戻す
      loadGroups();
    }
  };

  // グループ追加に関連する項目
  const addGroupPress = () => {
    if (groups.length >= DATA_LIMITS.FREE.MAX_GROUPS) {
      Alert.alert('確認', `現在作成できるグループ数は${DATA_LIMITS.FREE.MAX_GROUPS}個までです。`);
      return;
    }
    setGroupCreateModalVisible(true);
  };

  const toggleGroupCreateModal = () => {
    setGroupCreateModalVisible(!groupCreateModalVisible);
  };

  // グループの削除処理
  const handleDeleteGroupPress = async (groupId: string) => {
    console.log('グループ削除ボタンが押されました');

    try {
      // グループに紐づくアイテム数を取得
      const itemCount = await countItemsByGroupId(user.id, groupId);

      if (itemCount === 0) {
        // アイテムが0件の場合
        Alert.alert('確認', '削除しますが、よろしいですか？', [
          {
            text: 'キャンセル',
            style: 'cancel'
          },
          { text: '削除', style: 'destructive', onPress: () => deleteGroup(groupId) }
        ]);
      } else {
        // アイテムが1件以上ある場合
        Alert.alert(
          '注意',
          `このグループには${itemCount}件のItemがあります。\nこれらも同時に削除されますが、よろしいですか？`,
          [
            {
              text: 'キャンセル',
              style: 'cancel'
            },
            { text: '削除', style: 'destructive', onPress: () => deleteGroup(groupId) }
          ]
        );
      }
    } catch (error) {
      console.error('Error counting items:', error);
      Alert.alert('エラー', 'アイテム数の取得に失敗しました');
    }
  };

  const deleteGroup = async (groupId: string) => {
    // 楽観的削除（SWR）
    const currentGroups = [...groups];
    const updatedGroups = groups.filter(g => g.id !== groupId); // groupId を除外したグループを作成
    try {
      await setGroups(updatedGroups); // Contextのgroupsを即時更新（キャッシュも更新される）
      await deleteGroupByIdWithItems(user.id, groupId); // Firestoreのグループを削除
      // Revalidate in background
      // └ 再取得してローカルとキャッシュを同期（SWRの再検証）。他端末からの変更や、サーバー側で発生する副作用を検知
      loadGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      Alert.alert('エラー', '削除に失敗しました。元に戻します。');
      await setGroups(currentGroups);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.reorderButton}
          onPress={() => setIsReorderMode(!isReorderMode)}
        >
          {isReorderMode ? (
            <Text style={styles.saveText}>保存</Text>
          ) : (
            <MaterialCommunityIcons name="sort" size={28} color="#808080" />
          )}
        </TouchableOpacity>
      </View>

      <DraggableFlatList
        data={groups}
        onDragEnd={handleDragEnd}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={isReorderMode ? undefined : onRefresh}
        renderItem={({ item, drag }) => (
          <RenderGroupItem
            item={item}
            drag={drag}
            onDeletePress={() => handleDeleteGroupPress(item.id)}
            isReorderMode={isReorderMode}
          />
        )}
        containerStyle={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        scrollEnabled={!isReorderMode}
        dragItemOverflow={true}
        activationDistance={10}
        autoscrollThreshold={50}
        dragHitSlop={5}
        ListEmptyComponent={() => (
          <View style={styles.emptyGroupContainer}>
            <Text style={styles.emptyGroupText}>グループを作成してください</Text>
          </View>
        )}
      />
      <FloatingPlusButton onPress={addGroupPress} />
      <GroupCreateModal
        visible={groupCreateModalVisible}
        onClose={toggleGroupCreateModal}
        onSaved={async () => {
          await loadGroups();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  reorderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  saveText: {
    color: '#007AFF',
    fontSize: 20
  },
  emptyGroupContainer: {
    flex: 1,
    minHeight: Dimensions.get('window').height * 0.5, // 画面の高さのX%
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyGroupText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#808080'
  }
});
