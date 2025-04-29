import { View, Keyboard, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

/**
 * キーボードアクセサリーの閉じるボタンを表示する
 * @returns 閉じるボタン
 */
const KeyboardCloseButton: React.FC = () => {
  return (
    <View style={{ alignItems: 'flex-end', padding: 8 }}>
      <TouchableOpacity onPress={() => Keyboard.dismiss()}>
        <MaterialIcons name="keyboard-hide" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
};

export { KeyboardCloseButton };
