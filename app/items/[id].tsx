import { StyleSheet, Button, Alert } from 'react-native';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView } from '@gluestack-ui/themed';
import { ItemInputForm } from '../../src/components/items/ItemInputForm';
import * as ItemService from '../../src/services/itemService';

export default function ItemEditScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  // タイトルと内容の状態
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Itemの取得
  useEffect(() => {
    console.log('useEffect -> id', id);

    const fetchItem = async () => {
      try {
        const item = await ItemService.getItemById(Number(id));
        if (item) {
          setTitle(item.title);
          setContent(item.content);
        }
      } catch (error) {
        console.error('Itemの取得に失敗しました', error);
      }
    };
    fetchItem();
  }, [id]);

  // TitleとContentの変更を監視
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <Button title="保存" onPress={handleSaveItemPress} />;
      }
    });
  }, [title, content]);

  // 保存ボタン押下時の処理
  const handleSaveItemPress = async () => {
    // Validation
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
      await ItemService.updateItemById(Number(id), title, content);
      router.back();
    } catch (e) {
      Alert.alert('エラー', '保存に失敗しました', [{ text: 'OK', onPress: () => router.back() }]);
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
