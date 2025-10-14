import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { deleteAllItems } from '@services/itemService';
import { deleteAllGroups } from '@services/groupService';
import { useAuth, useAuthenticatedUser } from '@context/AuthContext';

type Anchor = { x: number; y: number } | null;

interface HomeMenuModalProps {
  visible: boolean;
  anchor: Anchor;
  onRequestClose: () => void;
  onDeletedAllItems: () => void;
}

const HomeMenuModal: React.FC<HomeMenuModalProps> = ({
  visible,
  anchor,
  onRequestClose,
  onDeletedAllItems
}) => {
  const user = useAuthenticatedUser();
  const { logout } = useAuth();
  const [modalWidth, setModalWidth] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  const margin = 20; // 画面端からの余白

  const estimatedWidth = modalWidth || 150;
  const adjustedPosition = anchor
    ? {
        x: Math.min(
          Math.max(margin, anchor.x - estimatedWidth / 2),
          screenWidth - estimatedWidth - margin
        ),
        y: anchor.y
      }
    : { x: margin, y: margin };

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setModalWidth(width);
  };

  // 全削除処理
  const deleteExecute = async () => {
    await deleteAllItems(user.id);
    await deleteAllGroups(user.id);
    onRequestClose();
    onDeletedAllItems();
  };

  // 全削除ボタン処理
  const handleDeleteAllPress = async () => {
    console.log('全てのアイテムを削除するが押されました');
    onRequestClose();
    Alert.alert('確認', '全てのアイテムを削除しますか？', [
      {
        text: 'キャンセル',
        style: 'cancel'
      },
      { text: '削除', onPress: () => deleteExecute() }
    ]);
  };

  // アカウント設定ボタン
  const handleAccountSettingsPress = () => {
    console.log('アカウント設定が押されました');
    router.push({ pathname: `/account` });
    onRequestClose();
  };

  // フィードバックボタン
  const handleFeedbackPress = () => {
    console.log('フィードバックが押されました');
    onRequestClose();
  };

  // ログアウトボタン
  const handleLogoutPress = () => {
    console.log('ログアウトが押されました');
    onRequestClose();
    Alert.alert('確認', 'ログアウトしますか？', [
      {
        text: 'キャンセル',
        style: 'cancel'
      },
      { text: 'ログアウト', onPress: () => performLogout() }
    ]);
  };

  const performLogout = async () => {
    try {
      await logout();
      // 直後のレイアウト再マウント完了を待ってから遷移
      requestAnimationFrame(() => {
        setTimeout(() => {
          router.replace('/');
        }, 0);
      });
    } catch (error) {
      Alert.alert('エラー', 'ログアウトに失敗しました');
      console.error(error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onRequestClose}
    >
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onRequestClose}>
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
          <TouchableOpacity style={styles.menuItem} onPress={handleAccountSettingsPress}>
            <Text style={styles.menuText}>アカウント設定</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAllPress}>
            <Text style={styles.menuText}>全てのアイテムを削除する</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleFeedbackPress}>
            <Text style={styles.menuText}>フィードバック</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogoutPress}>
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
