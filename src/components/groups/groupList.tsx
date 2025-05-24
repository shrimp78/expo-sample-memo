import { Button, ListItem } from '@rneui/base';
import { StyleSheet } from 'react-native';

type GroupListProps = {
  name: string;
  color: string;
};

const GroupList: React.FC<GroupListProps> = props => {
  const { name, color } = props;
  return (
    <ListItem.Swipeable bottomDivider>
      <ListItem.Content>
        <ListItem.Title>{name}</ListItem.Title>
      </ListItem.Content>
    </ListItem.Swipeable>
  );
};

export { GroupList };
