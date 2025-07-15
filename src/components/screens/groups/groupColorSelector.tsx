import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { HStack } from '@gluestack-ui/themed';
import { FontAwesome } from '@expo/vector-icons';
import { colorOptions } from '../../../../constants/colors';

type GroupColorSelectorProps = {
  groupColor: string;
  onChangeGroupColor: (color: string) => void;
};

const GroupColorSelector: React.FC<GroupColorSelectorProps> = props => {
  const { groupColor, onChangeGroupColor } = props;
  return (
    <View style={styles.colorOptionsContainer}>
      <HStack flexWrap="wrap" space="md" paddingHorizontal={'$2'} marginLeft={'$2'}>
        {colorOptions.map(color => (
          <TouchableOpacity
            key={color}
            onPress={() => onChangeGroupColor(color)}
            style={[styles.colorOption, groupColor === color && styles.selectedColorOption]}
          >
            <FontAwesome name="circle" size={32} color={color} />
          </TouchableOpacity>
        ))}
      </HStack>
    </View>
  );
};

const styles = StyleSheet.create({
  colorOptionsContainer: {
    marginTop: 16,
    paddingBottom: 20
  },
  colorOption: {
    padding: 8,
    borderRadius: 20,
    marginBottom: 8
  },
  selectedColorOption: {
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  }
});
export default GroupColorSelector;
