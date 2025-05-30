import { router, useFocusEffect } from 'expo-router';
import { View, ScrollView, StyleSheet, Text, FlatList, SectionList } from 'react-native';
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

  const handleDeletePress = (itemId: string) => {
    console.log('アイテムの削除が押されました', itemId);
    //TODO アイテムを削除する
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
      <SectionList sections={sections}></SectionList>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.groupName, { color: section.color }]}>{section.title}</Text>
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
        contentContainerStyle={{ paddingVertical: 40 }}
        stickySectionHeadersEnabled={false}
      {/* 全てのメモ
        <ListItem onPress={handleAllItemsPress}>
          <ListItem.Content>
            <ListItem.Title>全てのアイテム</ListItem.Title>
          </ListItem.Content>
        </ListItem> */}

      {/* グループのリスト new */}
      {/* {groups.map(group => {
          const filteredItems = items.filter(item => item.group_id === group.id);
          return (
            <View key={group.id}>
              <Text key={group.id} style={[styles.groupName, { color: group.color }]}>
                {group.name}
              </Text>
              <FlatList<Item>
                data={filteredItems}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <ItemList
                    name={item.title}
                    content={item.content}
                    onPress={() => handleItemPress(item.id)}
                    onDeletePress={() => handleDeletePress(item.id)}
                  />
                )}
              />
            </View>
          );
        })}

        <View style={styles.bottomContainer}></View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFF4'
  },
  scrollView: {
    paddingVertical: 40
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
  }
});
