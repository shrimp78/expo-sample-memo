import { Button, ListItem } from '@rneui/base';
import { StyleSheet } from 'react-native';
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
  const formatAnniv = (value: unknown): string => {
    try {
      // Firestore Timestamp
      if (value instanceof Timestamp) {
        return value.toDate().toLocaleDateString();
      }
      // 互換: { seconds, nanoseconds }
      if (
        value &&
        typeof value === 'object' &&
        'seconds' in (value as any) &&
        'nanoseconds' in (value as any)
      ) {
        const v = value as { seconds: number; nanoseconds: number };
        const millis = v.seconds * 1000 + Math.floor(v.nanoseconds / 1e6);
        return new Date(millis).toLocaleDateString();
      }
      // 互換: annivMillis(number)
      if (typeof value === 'number') {
        return new Date(value).toLocaleDateString();
      }
      // 互換: ISO文字列
      if (typeof value === 'string') {
        const d = new Date(value);
        if (!Number.isNaN(d.getTime())) return d.toLocaleDateString();
      }
    } catch {
      // noop
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
          {formatAnniv(anniv as unknown)}
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
