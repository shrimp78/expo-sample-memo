import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { HStack } from '@gluestack-ui/themed';
import { FontAwesome } from '@expo/vector-icons';
import { colorOptions } from '@constants/colors';

type GroupColorSelectorProps = {
  groupColor: string;
  onChangeGroupColor: (color: string) => void;
};

const GroupColorSelector: React.FC<GroupColorSelectorProps> = props => {
  const { groupColor, onChangeGroupColor } = props;
  return (
    <View style={styles.colorOptionsContainer}>
      <HStack
        flexWrap="wrap"
        paddingHorizontal={'$3'}
        justifyContent="space-between"
        style={styles.evenlySpacedRow}
      >
        {colorOptions.map(color => (
          <TouchableOpacity
            key={color}
            onPress={() => onChangeGroupColor(color)}
            style={[
              styles.colorOption,
              styles.evenlySpacedOption,
              groupColor === color && styles.selectedColorOption
            ]}
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
    marginRight: 8,
    marginBottom: 8
  },
  evenlySpacedRow: {
    width: '100%'
  },
  evenlySpacedOption: {
    marginRight: 0
  },
  selectedColorOption: {
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  }
});
export default GroupColorSelector;
