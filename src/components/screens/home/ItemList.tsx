import { Button, ListItem } from '@rneui/base';
import { StyleSheet, Alert, LayoutAnimation } from 'react-native';
import { Timestamp } from 'firebase/firestore';
import { useItems } from '@context/ItemContext';
import { useAuthenticatedUser } from '@context/AuthContext';
import { deleteItemById } from '@services/itemService';

type ItemListProps = {
  id: string;
  name: string;
  anniv: Timestamp;
  onPress: () => void;
};

const ItemList: React.FC<ItemListProps> = props => {
  const { id, name, anniv, onPress } = props;
  const { items, setItems } = useItems();
  const user = useAuthenticatedUser();
  // ローカル時刻の文字列へ安全に変換
  const formatAnniv = (anniv: Timestamp): string => {
    try {
      // Firestore Timestamp
      if (anniv instanceof Timestamp) {
        return anniv.toDate().toLocaleDateString();
      }
    } catch (e) {
      Alert.alert('エラー', 'データベースのAnnivの値の型が不正です');
      console.error(e);
    }
    return '';
  };

  // アイテムの削除
  const handleDeletePress = async (itemId: string) => {
    console.log('アイテムの削除が押されました', itemId);
    Alert.alert('確認', '削除しますが、よろしいですか？', [
      {
        text: 'キャンセル',
        style: 'cancel'
      },
      { text: '削除', onPress: () => deleteItem(itemId) }
    ]);
  };

  const deleteItem = async (itemId: string) => {
    console.log('アイテムの削除が押されました', itemId);
    try {
      // Optimistic update: ItemContextを即時反映
      const nextItems = items.filter(item => item.id !== itemId);
      setItems(nextItems);
      // 非同期で永続化（待たない）
      void deleteItemById(user.id, itemId);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch (e) {
      Alert.alert('エラー', '削除に失敗しました');
      throw e;
    }
  };

  return (
    <ListItem.Swipeable
      bottomDivider
      rightContent={reset => (
        <Button
          icon={{ name: 'trash-can', type: 'material-community', size: 26, color: '#ffffff' }}
          buttonStyle={{ minHeight: '100%', backgroundColor: '#ff0000' }}
          onPress={() => {
            handleDeletePress(id);
            reset();
          }}
        />
      )}
      onPress={onPress}
    >
      <ListItem.Content>
        <ListItem.Title style={styles.title}> {name}</ListItem.Title>
        <ListItem.Subtitle style={styles.content} numberOfLines={3}>
          {' '}
          {formatAnniv(anniv)}
        </ListItem.Subtitle>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem.Swipeable>
  );
};

const styles = StyleSheet.create({
  title: {
    color: '#4A5054',
    fontWeight: 'bold',
    fontSize: 20
  },
  content: {
    color: '#95A2AC',
    fontSize: 14,
    padding: 4,
    maxHeight: 100
  }
});

export default ItemList;
