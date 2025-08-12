import React, { useState } from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';

interface HomeMenuModalProps {
  visible: boolean;
  onClose: () => void;
  menuPosition: { x: number; y: number };
  onAccountSettingsPress?: () => void;
  onDeleteAllItemPress?: () => void;
  onGroupEditPress?: () => void;
  onFeedbackPress?: () => void;
  onLogoutPress?: () => void;
}

const HomeMenuModal: React.FC<HomeMenuModalProps> = ({
  visible,
  onClose,
  menuPosition,
  onAccountSettingsPress,
  onDeleteAllItemPress,
  onFeedbackPress,
  onLogoutPress
}) => {
  const [modalWidth, setModalWidth] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  const margin = 20; // 画面端からの余白

  // 位置を調整して画面内に収める
  const adjustedPosition = {
    x: Math.min(Math.max(margin, menuPosition.x), screenWidth - modalWidth - margin),
    y: menuPosition.y
  };

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setModalWidth(width);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <Animatable.View
          animation={visible ? 'fadeIn' : 'fadeOut'}
          duration={visible ? 200 : 30}
          style={[
            styles.menuContainer,
            {
              position: 'absolute',
              top: adjustedPosition.y,
              left: adjustedPosition.x
            }
          ]}
          onLayout={handleLayout}
        >
          <TouchableOpacity style={styles.menuItem} onPress={onAccountSettingsPress}>
            <Text style={styles.menuText}>アカウント設定</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={onDeleteAllItemPress}>
            <Text style={styles.menuText}>全てのアイテムを削除する</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={onFeedbackPress}>
            <Text style={styles.menuText}>フィードバック</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={onLogoutPress}>
            <Text style={[styles.menuText, styles.logoutText]}>ログアウト</Text>
          </TouchableOpacity>
        </Animatable.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1
  },
  menuContainer: {
    backgroundColor: '#ffffff',
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
  },
  logoutText: {
    color: '#ff0000' // ログアウトボタンのテキスト色を赤に設定
  }
});

export default HomeMenuModal;
