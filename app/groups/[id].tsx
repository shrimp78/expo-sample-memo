import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Button } from 'react-native';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { getGroupById, updateGroupName } from '../../src/services/groupService';
import { type Group } from '../../src/components/types/group';

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
      Alert.alert('完了', 'グループ名を更新しました', [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]);
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
      <View style={styles.content}>
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>グループ名</Text>
          <TextInput
            style={styles.textInput}
            value={groupName}
            onChangeText={setGroupName}
            placeholder="グループ名を入力"
            maxLength={50}
            autoFocus={true}
          />
          <Text style={styles.characterCount}>{groupName.length}/50</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
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
  content: {
    flex: 1,
    padding: 16
  },
  inputSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 0
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4
  }
});
