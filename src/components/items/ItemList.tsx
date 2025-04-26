import { Button, ListItem } from '@rneui/base';
import { StyleSheet } from 'react-native';

type ItemListProps = {
  name: string;
  content: string;
};

const ItemList: React.FC<ItemListProps> = props => {
  const { name, content } = props;
  return (
    <ListItem.Swipeable rightContent={<Button title="削除" />}>
      <ListItem.Content>
        <ListItem.Title> {name}</ListItem.Title>
      </ListItem.Content>
    </ListItem.Swipeable>
  );
};

export { ItemList };
