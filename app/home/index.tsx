import { router, useFocusEffect } from 'expo-router';
import {
  Alert,
  View,
  ScrollView,
  StyleSheet,
  Text,
  FlatList,
  SectionList,
  LayoutAnimation
} from 'react-native';
import { useCallback, useState } from 'react';
import { ListItem } from '@rneui/themed';
import * as ItemService from '../../src/services/itemService';
import * as GroupService from '../../src/services/groupService';
import { type Item } from '../../src/components/types/item';
import { type Group } from '../../src/components/types/group';
import { ItemList } from '../../src/components/items/ItemList';

export default function HomeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const items = await ItemService.getAllItems();
        setItems(items);
        const groups = await GroupService.getAllGroups();
        setGroups(groups);
      };
      loadData();
    }, [])
  );

  const handleAllItemsPress = () => {
    router.push({ pathname: '/items' });
  };

  // アイテムが押された時の処理
  const handleItemPress = (itemId: string) => {
    console.log('アイテムが押されました', itemId);
    router.push({ pathname: `/items/${itemId}` });
  };

  // アイテムの削除
  const handleDeletePress = async (itemId: string) => {
    console.log('アイテムの削除が押されました', itemId);
    try {
      await ItemService.deleteItemById(itemId);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const updatedItems = await ItemService.getAllItems();
      setItems(updatedItems);
    } catch (e) {
      Alert.alert('エラー', '削除に失敗しました');
      throw e;
    }
  };

  const handleGroupPress = (groupId: string) => {
    console.log('グループが押されました', groupId);
  };

  // グループセクション用のデータ整形
  const sections = groups.map(group => ({
    title: group.name,
    color: group.color,
    data: items.filter(item => item.group_id === group.id)
  }));

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={[styles.groupName, { color: section.color }]}>
              {section.title}
            </Text>
            <View
              style={[
                styles.sectionHeaderBorder,
                { backgroundColor: section.color }
              ]}
            />
          </View>
        )}
        renderItem={({ item }) => (
          <ItemList
            name={item.title}
            content={item.content}
            onPress={() => handleItemPress(item.id)}
            onDeletePress={() => handleDeletePress(item.id)}
          />
        )}
        ListFooterComponent={<View style={styles.bottomContainer} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFF4'
  },
  groupName: {
    marginTop: 30,
    marginBottom: 10,
    fontSize: 14,
    marginLeft: 14,
    fontWeight: 'bold'
  },
  bottomContainer: {
    height: 100
  },
  sectionHeader: {},
  sectionHeaderBorder: {
    flex: 1,
    height: 2
  }
});
