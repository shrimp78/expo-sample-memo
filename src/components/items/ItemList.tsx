import { Button, ListItem } from '@rneui/base';
import { StyleSheet } from 'react-native';

const ItemList: React.FC<ItemListProps> = props => {
  const { name, content } = props;
  return (
  <ListItem.Swipeable />
  <ListItem.Content>
    <ListItem.Title> test</ListItem.Title>
  </ListItem.Content>

  );
};
