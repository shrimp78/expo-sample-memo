import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { useState, useEffect } from 'react';
import { getAllGroups } from '../../src/services/groupService';
import { type Group } from '../../src/components/types/group';

export default function GroupIndexScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isReorderMode, setIsReorderMode] = useState(false);

  // グループデータを読み込み
  useEffect(() => {
    loadGroups();
  }, []);

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

  // position値を計算する関数（Trello方式）
  const calculateNewPosition = (
    fromIndex: number,
    toIndex: number,
    groupsList: Group[]
  ): number => {
    if (toIndex === 0) {
      // 最初に移動する場合
      const nextPosition = groupsList[0].position;
      return nextPosition / 2;
    } else if (toIndex === groupsList.length - 1) {
      // 最後に移動する場合
      const prevPosition = groupsList[groupsList.length - 1].position;
      return prevPosition + 65536; // 新しい位置は前の位置より大きく
    } else {
      // 中間に移動する場合
      const prevPosition = groupsList[toIndex - 1].position;
      const nextPosition = groupsList[toIndex + 1].position;
      return (prevPosition + nextPosition) / 2;
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
      const newPosition = calculateNewPosition(from, to, data);

      console.log(`Updating ${movedGroup.name} position to ${newPosition}`);

      // データベースのposition値を更新
      const { updateGroupPosition } = require('../../src/services/groupService');
      await updateGroupPosition(movedGroup.id, newPosition);

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

  // グループ項目のレンダリング
  const renderGroupItem = ({ item, drag, isActive }: RenderItemParams<Group>) => {
    return (
      <TouchableOpacity
        style={[styles.groupItem, { borderLeftColor: item.color }, isActive && styles.activeItem]}
        onLongPress={() => {
          if (isReorderMode) {
            console.log(`Starting drag for: ${item.name}`);
            drag();
          }
        }}
        delayLongPress={100}
        disabled={!isReorderMode}
      >
        <Text style={styles.groupName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.reorderButton, isReorderMode && styles.reorderButtonActive]}
          onPress={() => setIsReorderMode(!isReorderMode)}
        >
          <Text style={styles.reorderButtonText}>{isReorderMode ? '完了' : '並び替え'}</Text>
        </TouchableOpacity>
      </View>

      {isReorderMode && (
        <Text style={styles.instructionText}>長押ししてドラッグで順番を変更できます</Text>
      )}

      <DraggableFlatList
        data={groups}
        onDragEnd={handleDragEnd}
        keyExtractor={item => item.id}
        renderItem={renderGroupItem}
        containerStyle={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        scrollEnabled={!isReorderMode}
        dragItemOverflow={true}
        activationDistance={5}
        autoscrollThreshold={50}
        dragHitSlop={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  reorderButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  reorderButtonActive: {
    backgroundColor: '#FF3B30'
  },
  reorderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic'
  },
  list: {
    flex: 1
  },
  groupItem: {
    padding: 16,
    marginVertical: 4,
    borderLeftWidth: 6,
    backgroundColor: 'white'
  },
  activeItem: {
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'gray',
    marginBottom: 4
  }
});
