import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Button } from 'react-native';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { getGroupById, updateGroupById } from '@services/groupService';
import { KeyboardAvoidingView, Input, InputField } from '@gluestack-ui/themed';
import { type Group } from '@models/Group';
import GroupColorSelector from './GroupColorSelector';
import { useAuthenticatedUser } from '@context/AuthContext';
import { useGroups } from '@context/GroupContext';

export default function GroupEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupColor, setGroupColor] = useState('');
  const navigation = useNavigation();
  const user = useAuthenticatedUser();
  const { groups } = useGroups();

  // Groupの取得
  useEffect(() => {
    console.log('loadGroup()');
    const fetchGroup = async () => {
      try {
        if (!id) return;

        const groupData = await getGroupById(user.id, id);
        if (groupData) {
          setGroup(groupData);
          setGroupName(groupData.name);
          setGroupColor(groupData.color);
        } else {
          Alert.alert('エラー', 'グループが見つかりません');
          router.back();
        }
      } catch (error) {
        console.error('Error loading group:', error);
        Alert.alert('エラー', 'グループの読み込みに失敗しました');
        router.back();
      }
    };
    fetchGroup();
  }, [id]);

  // Contextのgroupsから即時に初期値を反映（stale-while-revalidate）
  useEffect(() => {
    console.log('stale-while-revalidate');
    if (!id) return;
    const cachedGroup = groups.find(g => g.id === id);
    if (cachedGroup) {
      setGroup(cachedGroup);
      setGroupName(cachedGroup.name);
      setGroupColor(cachedGroup.color);
    }
  }, [id, groups]);

  // TitleとContentの変更を監視
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <Button title="保存" onPress={handleSavePress} />;
      }
    });
  }, [groupName, groupColor, group]);

  const handleSavePress = async () => {
    if (!groupName) {
      Alert.alert('確認', 'グループ名を入力してください');
      return;
    }
    if (!groupColor) {
      Alert.alert('確認', 'グループの色を選択してください');
      return;
    }

    try {
      await updateGroupById(user.id, id, groupName, groupColor);
      router.back();
    } catch (error) {
      console.error('Error updating group:', error);
      Alert.alert('エラー', 'グループの更新に失敗しました');
    }
  };

  if (!group) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <View style={{ paddingBottom: 20 }}>
          {/* タイトル入力 */}
          <Input borderWidth={0} minWidth={'$full'} marginTop={'$8'} marginBottom={'$1'}>
            <InputField
              placeholder="グループ名"
              value={groupName}
              onChangeText={setGroupName}
              fontSize={'$3xl'}
              fontWeight={'$bold'}
              editable={true}
            />
          </Input>
        </View>
        {/* カラーオプション */}
        <Text style={styles.colorSelectorTitle}>グループの色を選択してください</Text>
        <View style={styles.colorSelectorContainer}>
          <GroupColorSelector groupColor={groupColor} onChangeGroupColor={setGroupColor} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  errorText: {
    fontSize: 16,
    color: '#666'
  },
  colorSelectorTitle: {
    marginLeft: 16,
    fontSize: 16,
    color: '#666',
    marginBottom: 10
  },
  colorSelectorContainer: {
    flex: 1
  }
});
