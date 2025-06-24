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
    const initializeAndLoadGroups = async () => {
      try {
        // テーブル作成を確実に実行
        await require('../../src/services/groupService').createTable();

        // データがない場合は初期データを挿入
        const count = await require('../../src/services/groupService').countGroups();
        if (count === 0) {
          const initialData = require('../../src/data/initialGroupData.json');
          for (const group of initialData) {
            await require('../../src/services/groupService').insertGroup(
              group.id,
              group.name,
              group.color,
              group.position
            );
          }
        }

        await loadGroups();
      } catch (error) {
        console.error('Error initializing groups:', error);
      }
    };

    initializeAndLoadGroups();
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
      const nextPosition = groupsList[toIndex].position;
      return (prevPosition + nextPosition) / 2;
    }
  };

  // ドラッグ操作時の処理
  const handleDragEnd = ({ data, from, to }: { data: Group[]; from: number; to: number }) => {
    if (from === to) return;

    const movedGroup = groups[from];
    const newGroups = [...data];

    // 新しいposition値を計算
    const newPosition = calculateNewPosition(from, to, newGroups);

    // 移動したグループのposition値を更新
    const updatedGroup = { ...movedGroup, position: newPosition };
    newGroups[to] = updatedGroup;

    // ログ出力
    console.log('=== Group Position Update ===');
    console.log(`Group "${movedGroup.name}" moved from index ${from} to ${to}`);
    console.log(`Old position: ${movedGroup.position}`);
    console.log(`New position: ${newPosition}`);
    console.log('Updated group list positions:');
    newGroups.forEach((group, index) => {
      console.log(`  ${index}: ${group.name} - position: ${group.position}`);
    });
    console.log('==============================');

    setGroups(newGroups);
  };

  // グループ項目のレンダリング
  const renderGroupItem = ({ item, drag, isActive }: RenderItemParams<Group>) => {
    return (
      <TouchableOpacity
        style={[styles.groupItem, { backgroundColor: item.color }, isActive && styles.activeItem]}
        onLongPress={isReorderMode ? drag : undefined}
      >
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.positionText}>Position: {item.position.toFixed(1)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>グループ一覧</Text>
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
        contentContainerStyle={{ flexGrow: 1 }}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
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
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22
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
    color: 'white',
    marginBottom: 4
  },
  positionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)'
  }
});
