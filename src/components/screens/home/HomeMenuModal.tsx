import React from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet } from 'react-native';

interface HomeMenuModalProps {
  visible: boolean;
  onClose: () => void;
  menuPosition: { x: number; y: number };
  onSettingPress?: () => void;
  onHelpPress?: () => void;
  onFeedbackPress?: () => void;
}

const HomeMenuModal: React.FC<HomeMenuModalProps> = ({
  visible,
  onClose,
  menuPosition,
  onSettingPress,
  onHelpPress,
  onFeedbackPress
}) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View
          style={[
            styles.menuContainer,
            {
              position: 'absolute',
              top: menuPosition.y,
              left: menuPosition.x
            }
          ]}
        >
          <TouchableOpacity style={styles.menuItem} onPress={onSettingPress}>
            <Text style={styles.menuText}>設定</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={onHelpPress}>
            <Text style={styles.menuText}>ヘルプ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={onFeedbackPress}>
            <Text style={styles.menuText}>フィードバック</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  menuText: {
    fontSize: 16,
    color: '#333'
  }
});

export default HomeMenuModal;
