import { router } from 'expo-router';
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Alert, Modal, TouchableOpacity, Text, StyleSheet, Dimensions, GestureResponderEvent } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { deleteAllItems } from '@services/itemService';
import { deleteAllGroups } from '@services/groupService';
import { useAuth, useAuthenticatedUser } from '@context/AuthContext';

export type HomeMenuModalRef = {
  openAt: (event: GestureResponderEvent) => void;
  close: () => void;
};

interface HomeMenuModalProps {
  onDeletedAllItems: () => void;
}

const HomeMenuModal = forwardRef<HomeMenuModalRef, HomeMenuModalProps>(({ onDeletedAllItems }, ref) => {
  const user = useAuthenticatedUser();
  const { logout } = useAuth();
  const [visible, setVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [modalWidth, setModalWidth] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  const margin = 20; // 画面端からの余白

  // Imperative methods
  useImperativeHandle(ref, () => ({
    openAt: (event: GestureResponderEvent) => {
      const { pageX, pageY } = event.nativeEvent;
      const estimatedWidth = modalWidth || 150;
      let x = pageX - estimatedWidth / 2; // タップ位置中央に揃える
      if (x < margin) {
        x = margin;
      } else if (x + estimatedWidth > screenWidth - margin) {
        x = screenWidth - estimatedWidth - margin;
      }
      setMenuPosition({ x, y: pageY + 10 });
      setVisible(true);
    },
    close: () => setVisible(false)
  }));

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
    setVisible(false);
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

  // アカウント設定ボタン
  const handleAccountSettingsPress = () => {
    console.log('アカウント設定が押されました');
    router.push({ pathname: `/account` });
    setVisible(false);
  };

  // フィードバックボタン
  const handleFeedbackPress = () => {
    console.log('フィードバックが押されました');
    setVisible(false);
  };

  // ログアウトボタン
  const handleLogoutPress = () => {
    console.log('ログアウトが押されました');
    setVisible(false);
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
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={() => setVisible(false)}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setVisible(false)}>
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
});

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
