import { TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const FloatingPlusButton: React.FC<{ onPress: () => void }> = props => {
  const { onPress } = props;
  return (
    <TouchableOpacity style={styles.floatingButton} onPress={onPress}>
      <Feather name="plus" size={24} color="#808080" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 40,
    elevation: 5, // Android用の影
    shadowColor: '#000', // iOS用の影
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: 30
  }
});

export default FloatingPlusButton;
