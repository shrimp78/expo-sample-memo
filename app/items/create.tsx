import { View, Text, StyleSheet, Button, TextInput } from 'react-native';
import { KeyboardAvoidingView } from '@gluestack-ui/themed';
import { useState, useEffect } from 'react';
import { router, useNavigation } from 'expo-router';
import { ItemInputForm } from '../../src/components/items/ItemImputForm';

export default function CreateItemScreen() {
  // タイトルと内容の状態
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // ヘッダーの保存ボタン表示
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <Button title="保存" onPress={handleSaveItemPress} />;
      }
    });
  }, []);

  // 保存ボタン押下時の処理
  const handleSaveItemPress = () => {
    console.log('保存ボタンが押されました');
  };

  return (
    //あとでこれをKeyboardAvoidingViewに変更する
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
