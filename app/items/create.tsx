import { StyleSheet, Button, TextInput, Alert } from 'react-native';
import { KeyboardAvoidingView } from '@gluestack-ui/themed';
import { useState, useEffect } from 'react';
import { router, useNavigation } from 'expo-router';
import { ItemInputForm } from '../../src/components/items/ItemInputForm';
import * as ItemService from '../../src/services/itemService';
import { v4 as uuidv4 } from 'uuid';

export default function CreateItemScreen() {
  // タイトルと内容の状態
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');

  // ヘッダーの保存ボタン表示と、入力内容の変更を監視
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <Button title="保存" onPress={handleSaveItemPress} />;
      }
    });
  }, [title, content]);

  // 保存ボタン押下時の処理
  const handleSaveItemPress = async () => {
    console.log('保存ボタンが押されました');
    // TODO: loading画面の実装

    // バリデーション
    if (!title) {
      Alert.alert('確認', 'タイトルを入力してください');
      return;
    }
    if (!content) {
      Alert.alert('確認', 'コンテンツを入力してください');
      return;
    }

    // 保存処理
    try {
      await ItemService.createItem(uuidv4(), title, content);
      router.back();
    } catch (e) {
      Alert.alert('エラー', '保存に失敗しました');
      console.error(e);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={100} style={styles.container}>
      <ItemInputForm title={title} content={content} onChangeTitle={setTitle} onChangeContent={setContent} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  }
});
