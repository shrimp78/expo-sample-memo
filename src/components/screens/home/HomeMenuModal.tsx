import React, { useState } from 'react';
import { Alert, Modal, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { deleteAllItems } from '@services/itemService';
import { deleteAllGroups } from '@services/groupService';
import { useAuth, useAuthenticatedUser } from '@context/AuthContext';

interface HomeMenuModalProps {
  visible: boolean;
  onClose: () => void;
  menuPosition: { x: number; y: number };
  onAccountSettingsPress?: () => void;
  onDeletedAllItems: () => void;
  onGroupEditPress?: () => void;
  onFeedbackPress?: () => void;
  onLogoutPress?: () => void;
}

const HomeMenuModal: React.FC<HomeMenuModalProps> = ({
  visible,
  onClose,
  menuPosition,
  onAccountSettingsPress,
  onDeletedAllItems,
  onFeedbackPress,
  onLogoutPress
}) => {
  const user = useAuthenticatedUser();
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

  // 全削除処理
  const deleteExecute = async () => {
    await deleteAllItems(user.id);
    await deleteAllGroups(user.id);
    onClose();
    onDeletedAllItems();
  };

  // 全削除ボタン処理
  const handleDeleteAllPress = async () => {
    console.log('全てのアイテムを削除するが押されました');
    Alert.alert('確認', '全てのアイテムを削除しますか？', [
      {
        text: 'キャンセル',
        style: 'cancel'
      },
      { text: '削除', onPress: () => deleteExecute() }
    ]);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <Animatable.View
          animation={visible ? 'fadeIn' : 'fadeOut'}
          duration={visible ? 200 : 50}
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
          <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAllPress}>
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
