import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useState, useEffect } from 'react';
import { getAllGroups } from '../../src/services/groupService';
import { type Group } from '../../src/components/types/group';
import FloatingPlusButton from '../../src/components/common/floatingPlusButton';
import GroupCreateModal from '../../src/components/groups/groupCreateModal';
import * as Crypto from 'expo-crypto';
import * as GroupService from '../../src/services/groupService';
import { useFocusEffect } from 'expo-router';
import React from 'react';
import RenderGroupItem from '../../src/components/groups/renderGroupItem';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

export default function GroupIndexScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [groupCreateModalVisible, setGroupCreateModalVisible] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupColor, setGroupColor] = useState('#007AFF');

  // グループデータを読み込み
  useEffect(() => {
    loadGroups();
  }, []);

  // 画面がフォーカスされたときにグループを再取得
  useFocusEffect(
    React.useCallback(() => {
      loadGroups();
    }, [])
  );

  const loadGroups = async () => {
    try {
      const allGroups = await getAllGroups();
      // positionでソート
      const sortedGroups = allGroups.sort((a, b) => a.position - b.position);
      setGroups(sortedGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  // ドラッグ操作時の処理
  const handleDragEnd = async ({ data, from, to }: { data: Group[]; from: number; to: number }) => {
    if (from === to) return;

    console.log('=== Drag End Debug ===');
    console.log(`Moving from ${from} to ${to}`);
    console.log(
      'Data received:',
      data.map((g, i) => `${i}: ${g.name}`)
    );

    try {
      // dataをそのまま使用（DraggableFlatListが既に順序を変更済み）
      setGroups(data);

      // 移動したグループの新しいposition値を計算してデータベースに保存
      const movedGroup = data[to];
      const newPosition = GroupService.calculateNewPosition(to, data);

      console.log(`Updating ${movedGroup.name} position to ${newPosition}`);

      // データベースのposition値を更新
      await GroupService.updateGroupPosition(movedGroup.id, newPosition);

      // position値をローカルstateにも反映
      const updatedData = [...data];
      updatedData[to] = { ...movedGroup, position: newPosition };
      setGroups(updatedData);
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
    console.log('グループの色が指定されました', color);
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
      setGroupColor('#007AFF');
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
            <AntDesign name="save" size={24} color="gray" />
          ) : (
            <MaterialCommunityIcons name="sort" size={24} color="gray" />
          )}
        </TouchableOpacity>
      </View>

      <DraggableFlatList
        data={groups}
        onDragEnd={handleDragEnd}
        keyExtractor={item => item.id}
        renderItem={({ item, drag, isActive }) => (
          <RenderGroupItem
            item={item}
            drag={drag}
            isActive={isActive}
            isReorderMode={isReorderMode}
          />
        )}
        containerStyle={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        scrollEnabled={!isReorderMode}
        dragItemOverflow={true}
        activationDistance={5}
        autoscrollThreshold={50}
        dragHitSlop={10}
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
    backgroundColor: 'white',
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
  }
});
