import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView } from '@gluestack-ui/themed';
import { ItemInputForm } from '../../src/components/items/ItemInputForm';
import { DUMMY_ITEMS } from '../../src/data/dummyItemData';

export default function ItemEditScreen() {
  const { id } = useLocalSearchParams();

  // タイトルと内容の状態
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    console.log('useEffect -> id', id);
    const item = DUMMY_ITEMS.find(item => item.id === Number(id));
    if (item) {
      setTitle(item.title);
      setContent(item.content);
    }
    // TODO: アイテムが見つからない場合の処理を後で追加する
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
