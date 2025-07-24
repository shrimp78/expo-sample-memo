import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useState, useCallback, useEffect } from 'react';
import { type Group } from '@models/Group';
import FloatingPlusButton from '@components/common/FloatingPlusButton';
import GroupCreateModal from '@screens/groups/GroupCreateModal';
import * as Crypto from 'expo-crypto';
import * as GroupService from '@services/groupService';
import { countItemsByGroupId } from '@services/itemService';
import { useFocusEffect, router } from 'expo-router';
import RenderGroupItem from '@screens/groups/RenderGroupItem';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colorOptions } from '@constants/colors';
import { useGroups } from '@context/GroupContext';
import { useAuth } from '@context/AuthContext';

export default function GroupIndexScreen() {
  const { isLoggedIn } = useAuth();
  const { groups, loadGroups, updateGroupsOrder } = useGroups();
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [groupCreateModalVisible, setGroupCreateModalVisible] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupColor, setGroupColor] = useState(colorOptions[0]);

  // 認証状態チェック
  useEffect(() => {
    if (!isLoggedIn) {
      // 未ログインの場合はルート画面にリダイレクト
      router.replace('/');
    }
  }, [isLoggedIn]);

  //  画面がフォーカスされたときにグループを再取得;
  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn) {
        loadGroups();
      }
    }, [isLoggedIn])
  );

  // ドラッグ操作時の処理
  const handleDragEnd = async ({ data, from, to }: { data: Group[]; from: number; to: number }) => {
    if (from === to) return;

    try {
      // dataをそのまま使用（DraggableFlatListが既に順序を変更済み）
      updateGroupsOrder(data);

      // 移動したグループの新しいposition値を計算してデータベースに保存
      const movedGroup = data[to];
      const newPosition = GroupService.calculateNewPosition(to, data);

      // データベースのposition値を更新
      await GroupService.updateGroupPosition(movedGroup.id, newPosition);

      // position値をローカルstateにも反映
      const updatedData = [...data];
      updatedData[to] = { ...movedGroup, position: newPosition };
      updateGroupsOrder(updatedData);
    } catch (error) {
      console.error('Error updating group position:', error);
      // エラーの場合は元の状態に戻す
      loadGroups();
    }
  };

  // グループ追加に関連する項目
  const addGroupPress = () => {
    setGroupCreateModalVisible(true);
  };

  const toggleGroupCreateModal = () => {
    setGroupCreateModalVisible(!groupCreateModalVisible);
  };

  const handleChangeGroupColor = (color: string) => {
    setGroupColor(color);
  };

  // グループの保存処理
  const handleSaveGroupPress = async () => {
    console.log('グループの保存が押されました');

    // バリデーション
    if (!groupName) {
      Alert.alert('確認', 'グループ名を入力してください');
      return;
    }
    if (!groupColor) {
      Alert.alert('確認', 'グループの色を選択してください');
      return;
    }

    // 保存処理
    try {
      const id = Crypto.randomUUID();

      // 新しいグループは必ず一番最後の位置に保存する
      const maxPosition = await GroupService.getMaxPosition();
      const newPosition = maxPosition + 65536;

      await GroupService.insertGroup(id, groupName, groupColor, newPosition);
      toggleGroupCreateModal();
      await loadGroups();
    } catch (e) {
      Alert.alert('エラー', '保存に失敗しました');
      console.error(e);
    } finally {
      setGroupName('');
      setGroupColor('#2196f3');
    }
  };

  // グループの削除処理
  const handleDeleteGroupPress = async (groupId: string) => {
    console.log('グループ削除ボタンが押されました');

    try {
      // グループに紐づくアイテム数を取得
      const itemCount = await countItemsByGroupId(groupId);

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
    await GroupService.deleteGroupById(groupId);
    await loadGroups();
  };

  // 未ログインの場合は何も表示しない（リダイレクト処理中）
  if (!isLoggedIn) {
    return null;
  }

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
        toggleCreateModal={toggleGroupCreateModal}
        onSave={handleSaveGroupPress}
        groupName={groupName}
        groupColor={groupColor}
        onChangeGroupName={setGroupName}
        onChangeGroupColor={handleChangeGroupColor}
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
