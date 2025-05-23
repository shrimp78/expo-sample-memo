import { router, useFocusEffect } from 'expo-router';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useCallback, useState } from 'react';
import { ListItem } from '@rneui/themed';
import * as GroupService from '../../src/services/groupService';
import { type Group } from '../../src/components/types/group';

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

        <Text style={styles.sectionTitle}>グループ</Text>

        {/* グループのリスト */}
        {groups.map(group => (
          <ListItem key={group.id} onPress={() => handleGroupPress(group.id)}>
            <ListItem.Content>
              <ListItem.Title>{group.name}</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        ))}
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
  sectionTitle: {
    marginTop: 30,
    marginBottom: 10,
    fontSize: 14,
    marginLeft: 14,
    color: '#707070'
  }
});
