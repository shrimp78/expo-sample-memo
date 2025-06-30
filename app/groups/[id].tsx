import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Button,
  Platform,
  InputAccessoryView
} from 'react-native';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { getGroupById, updateGroupName } from '../../src/services/groupService';
import { KeyboardAvoidingView, Input, InputField } from '@gluestack-ui/themed';
import { type Group } from '../../src/components/types/group';
import KeyboardCloseButton from '../../src/components/common/KeyboardCloseButton';

const inputAccessoryViewID = 'INPUT_ACCESSORY_VIEW_ID_GROUP';

export default function GroupEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState('');
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
  }, [groupName, group]);

  const loadGroup = async () => {
    try {
      if (!id) return;

      const groupData = await getGroupById(id);
      if (groupData) {
        setGroup(groupData);
        setGroupName(groupData.name);
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
    if (!id || !groupName.trim()) {
      Alert.alert('確認', 'グループ名を入力してください');
      return;
    }

    try {
      await updateGroupName(id, groupName.trim());
      router.back();
    } catch (error) {
      console.error('Error updating group:', error);
      Alert.alert('エラー', 'グループ名の更新に失敗しました');
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  characterCount: {
    fontSize: 16,
    color: '#999',
    textAlign: 'left',
    marginTop: 4,
    marginLeft: 12
  }
});
