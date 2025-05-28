import { router, useFocusEffect } from 'expo-router';
import { View, ScrollView, StyleSheet, Text, FlatList } from 'react-native';
import { useCallback, useState } from 'react';
import { ListItem } from '@rneui/themed';
import * as ItemService from '../../src/services/itemService';
import * as GroupService from '../../src/services/groupService';
import { type Item } from '../../src/components/types/item';
import { type Group } from '../../src/components/types/group';
import { ItemList } from '../../src/components/items/ItemList';
import { GroupList } from '../../src/components/groups/groupList';

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

  const handleItemPress = (itemId: string) => {
    console.log('アイテムが押されました', itemId);
    //TODO アイテムの詳細画面に遷移する
  };

  const handleDeletePress = (itemId: string) => {
    console.log('アイテムの削除が押されました', itemId);
    //TODO アイテムを削除する
  };

  const handleGroupPress = (groupId: string) => {
    console.log('グループが押されました', groupId);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 全てのメモ */}
        <ListItem onPress={handleAllItemsPress}>
          <ListItem.Content>
            <ListItem.Title>全てのアイテム</ListItem.Title>
          </ListItem.Content>
        </ListItem>

        {/* グループのリスト new */}
        {groups.map(group => {
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
                  <ItemList name="kame" onPress={() => handleItemPress(item.id)} onDeletePress={() => handleDeletePress(item.id)} />
                )}
              />
            </View>
          );
        })}

        {/* グループのリスト old */}
        <FlatList<Group>
          data={groups}
          keyExtractor={group => group.id.toString()}
          renderItem={({ item }) => <GroupList name={item.name} color={item.color} />}
        />
      </ScrollView>
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
  }
});
