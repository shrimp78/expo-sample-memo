import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView } from '@gluestack-ui/themed';
import { ItemInputForm } from '../../src/components/items/ItemInputForm';
import * as ItemService from '../../src/services/itemService';

export default function ItemEditScreen() {
  const { id } = useLocalSearchParams();

  // タイトルと内容の状態
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

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
