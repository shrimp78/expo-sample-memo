import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Button, Platform, InputAccessoryView } from 'react-native';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { getGroupById, updateGroup } from '../../src/services/groupService';
import { KeyboardAvoidingView, Input, InputField } from '@gluestack-ui/themed';
import { type Group } from '../../src/components/types/group';
import KeyboardCloseButton from '../../src/components/common/KeyboardCloseButton';
import GroupColorSelector from '../../src/components/groups/groupColorSelector';

const inputAccessoryViewID = 'INPUT_ACCESSORY_VIEW_ID_GROUP';

export default function GroupEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupColor, setGroupColor] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    loadGroup();
  }, [id]);

  // TitleとContentの変更を監視
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <Button title="保存" onPress={handleSavePress} />;
      }
    });
  }, [groupName, groupColor, group]);

  const loadGroup = async () => {
    try {
      if (!id) return;

      const groupData = await getGroupById(id);
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
      await updateGroup({
        id,
        name: groupName.trim(),
        color: groupColor
      });
      router.back();
    } catch (error) {
      console.error('Error updating group:', error);
      Alert.alert('エラー', 'グループの更新に失敗しました');
    }
  };

  if (!group) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>グループが見つかりません</Text>
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
              inputAccessoryViewID={inputAccessoryViewID}
              fontSize={'$3xl'}
              fontWeight={'$bold'}
              editable={true}
            />
          </Input>

          {/* iOSのみキーボードの閉じるボタンを表示 */}
          {Platform.OS === 'ios' && (
            <InputAccessoryView nativeID={inputAccessoryViewID} backgroundColor={'#F1F1F1'}>
              <KeyboardCloseButton />
            </InputAccessoryView>
          )}
        </View>
        <View>
          <Text style={styles.characterCount}>{groupName.length}/50</Text>
        </View>
        {/* カラーオプション */}
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
    backgroundColor: '#ffffff'
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
  characterCount: {
    fontSize: 16,
    color: '#999',
    textAlign: 'left',
    marginTop: 4,
    marginLeft: 20
  },
  colorSelectorContainer: {
    flex: 1
  }
});
