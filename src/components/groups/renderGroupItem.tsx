import { Group } from '../types/group';
import { router } from 'expo-router';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';

type RenderGroupItemParams = {
  item: Group;
  drag: () => void;
  isActive: boolean;
  isReorderMode: boolean;
};

const RenderGroupItem: React.FC<RenderGroupItemParams> = props => {
  const { item, drag, isActive, isReorderMode } = props;

  const handleGroupPress = () => {
    if (!isReorderMode) {
      // 並び替えモードでない場合は編集画面に遷移
      console.log('handleGroupPress -> item.id', item.id);
      router.push(`/groups/${item.id}`);
    }
  };

  const handleLongPress = () => {
    if (isReorderMode) {
      console.log(`Starting drag for: ${item.name}`);
      drag();
    }
  };

  return (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={handleGroupPress}
      onLongPress={handleLongPress}
      delayLongPress={500} // 短すぎるとタップの判定が難しくなる
      disabled={isReorderMode} // 並び替えモードの時はタップを無効にする
      activeOpacity={0.7}
      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
    >
      <View style={styles.groupItemContent}>
        {isReorderMode && (
          <Feather name="menu" size={20} color="#999" style={styles.hamburgerIcon} />
        )}
        <FontAwesome name="circle" size={32} color={item.color} style={styles.groupColorIcon} />
        <Text style={[styles.groupName, isReorderMode && styles.groupNameWithIcon]}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  groupItem: {
    padding: 12,
    marginVertical: 4
  },
  groupItemContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  hamburgerIcon: {
    marginRight: 12
  },
  groupColorIcon: {
    marginRight: 4
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 12
  },
  groupNameWithIcon: {
    marginLeft: 12,
    marginBottom: 0
  }
});

export default RenderGroupItem;
