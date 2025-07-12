import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { HStack } from '@gluestack-ui/themed';
import { FontAwesome } from '@expo/vector-icons';

type GroupColorSelectorProps = {
  groupColor: string;
  onChangeGroupColor: (color: string) => void;
};

// グループカラーのプリセット（マテリアルカラー500番）
const colorOptions = [
  '#2196f3', // Blue 500
  '#03a9f4', // Light Blue 500
  '#00bcd4', // Cyan 500
  '#3f51b5', // Indigo 500
  '#f44336', // Red 500
  '#e91e63', // Pink 500
  '#9c27b0', // Purple 500
  '#673ab7', // Deep Purple 500
  '#009688', // Teal 500
  '#4caf50', // Green 500
  '#8bc34a', // Light Green 500
  '#cddc39', // Lime 500
  '#ffeb3b', // Yellow 500
  '#ffc107', // Amber 500
  '#ff9800', // Orange 500
  '#ff5722', // Deep Orange 500
  '#795548', // Brown 500
  '#9e9e9e', // Grey 500
  '#607d8b', // Blue Grey 500
  '#37474f', // Blue Grey 800
  '#424242', // Grey 800
  '#000000' // Black
];

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
