import { Button, ListItem } from '@rneui/base';
import { StyleSheet, Alert } from 'react-native';
import { Timestamp } from 'firebase/firestore';

type ItemListProps = {
  name: string;
  anniv: Timestamp;
  onPress: () => void;
  onDeletePress: () => void;
};

const ItemList: React.FC<ItemListProps> = props => {
  const { name, anniv, onPress, onDeletePress } = props;
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

  return (
    <ListItem.Swipeable
      bottomDivider
      rightContent={reset => (
        <Button
          icon={{ name: 'trash-can', type: 'material-community', size: 26, color: '#ffffff' }}
          buttonStyle={{ minHeight: '100%', backgroundColor: '#ff0000' }}
          onPress={() => {
            console.log('DeleteButton onPress');
            if (onDeletePress) {
              onDeletePress();
            }
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
