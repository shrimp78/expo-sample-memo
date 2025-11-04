import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, Modal, View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { deleteAllItems } from '@services/itemService';
import { deleteAllGroups } from '@services/groupService';
import { useAuth, useAuthenticatedUser } from '@context/AuthContext';
import ActivityIndicatorModal from '@components/common/ActivityIndicatorModal';

type Anchor = { x: number; y: number };

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
  const [isLoading, setIsLoading] = useState(false);
  const [animationType, setAnimationType] = useState<'fade' | 'none'>('fade');
  const screenWidth = Dimensions.get('window').width;
  const leftMargin = 20; // 画面端からの余白
  const rightMargin = 20; // 画面端からの余白

  const estimatedWidth = modalWidth || 150;
  const modalLeftEdge = anchor.x - estimatedWidth / 2;
  const minWidthFromRightEdge = screenWidth - estimatedWidth - rightMargin;
  // モーダル左上の角の位置は以下の３択となる
  // 1. アンカーが中央付近の場合、中央に揃える
  // 2. 左側にはみ出しそうなら、leftMargin に揃える
  // 3. 右側にはみ出しそうなら、rightMarginに揃える（画面幅 - Margin - モーダル幅）
  const adjustedPosition = {
    x: Math.min(Math.max(leftMargin, modalLeftEdge), minWidthFromRightEdge),
    y: anchor.y
  };

  // 初回マウント時に onLayoutのイベントを受け取り、モーダルの幅を取得する
  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout; // モーダルの幅だけ取得
    setModalWidth(width);
  };

  // visibleがfalseになったら、次回のためにアニメーションタイプをfadeに戻す
  useEffect(() => {
    if (!visible) {
      setAnimationType('fade');
    }
  }, [visible]);

  // 全削除処理
  const deleteExecute = async () => {
    setIsLoading(true);
    try {
      await deleteAllItems(user.id);
      await deleteAllGroups(user.id);
      onRequestClose();
      onDeletedAllItems();
    } catch (error) {
      Alert.alert('エラー', '削除に失敗しました');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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
    // 画面遷移を素早くするため、アニメーションなしで即座に閉じる
    setAnimationType('none');
    // 次のフレームで遷移と閉じる処理を実行（アニメーションタイプの変更を確実に反映）
    requestAnimationFrame(() => {
      router.push({ pathname: `/account` });
      onRequestClose();
    });
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
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType={animationType}
        onRequestClose={onRequestClose}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onRequestClose}>
          <View
            onLayout={handleLayout} // モーダルの幅を取得する
            style={[
              styles.menuContainer,
              {
                position: 'absolute',
                top: adjustedPosition.y,
                left: adjustedPosition.x
              }
            ]}
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
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 読込中のくるくる */}
      <ActivityIndicatorModal isLoading={isLoading} loadingText="削除しています…" />
    </>
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
