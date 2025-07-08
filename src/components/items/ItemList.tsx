import { Button, ListItem } from '@rneui/base';
import { StyleSheet } from 'react-native';

type ItemListProps = {
  name: string;
  content?: string;
  onPress: () => void;
  onDeletePress: () => void;
};

const ItemList: React.FC<ItemListProps> = props => {
  const { name, content, onPress, onDeletePress } = props;
  return (
    <ListItem.Swipeable
      bottomDivider
      rightContent={reset => (
        <Button
          title="削除"
          icon={{ name: 'delete', color: '#ffffff' }}
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
          {content ?? ''}
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
