import { router, useFocusEffect } from 'expo-router';
import { View, ScrollView, StyleSheet, Text, FlatList } from 'react-native';
import { useCallback, useState } from 'react';
import { ListItem } from '@rneui/themed';
import * as GroupService from '../../src/services/groupService';
import { type Group } from '../../src/components/types/group';
import { GroupList } from '../../src/components/groups/groupList';

export default function HomeScreen() {
  const [groups, setGroups] = useState<Group[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const groups = await GroupService.getAllGroups();
        setGroups(groups);
      };
      loadData();
    }, [])
  );

  const handleAllItemsPress = () => {
    router.push({ pathname: '/items' });
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
        {groups.map(group => (
          <Text key={group.id} style={[styles.groupName, { color: group.color }]}>
            {group.name}
          </Text>
        ))}

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
