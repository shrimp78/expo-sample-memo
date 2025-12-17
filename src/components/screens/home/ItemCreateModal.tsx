import { useState, useEffect, useRef } from 'react';
import {
  Modal,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  Button,
  KeyboardAvoidingView,
  StyleSheet,
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import GroupSelectModal from '@components/common/GroupSelectModal';
import { AntDesign } from '@expo/vector-icons';
import ItemInputForm from '@components/common/ItemInputForm';
import { useAuthenticatedUser } from '@context/AuthContext';
import { useGroups } from '@context/GroupContext';
import { type Group } from '@models/Group';
import * as Crypto from 'expo-crypto';
import { saveItem } from '@services/itemService';
import { Timestamp } from 'firebase/firestore';
import { useItems } from '@context/ItemContext';

type ItemCreateProps = {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void; //保存後に親に通知する
};

const ItemCreateModal: React.FC<ItemCreateProps> = ({ visible, onClose, onSaved }) => {
  const user = useAuthenticatedUser();
  const { groups } = useGroups();
  const { items, setItems } = useItems();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);

  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [day, setDay] = useState<number>(new Date().getDate());

  // モーダルが開いたら初期化
  useEffect(() => {
    if (!visible) return;
    setTitle('');
    setContent('');
    setGroupModalVisible(false);
    setSelectedGroup(groups.length === 1 ? groups[0] : null);
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setDay(now.getDate());
  }, [visible, groups]);

  const handleSave = async () => {
    if (!title) {
      Alert.alert('確認', 'タイトルを入力してください');
      return;
    }
    if (!selectedGroup) {
      Alert.alert('確認', 'グループを選択してください');
      return;
    }

    const id = Crypto.randomUUID();
    try {
      const group_id = selectedGroup.id;
      const utcMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      const birthday = Timestamp.fromDate(utcMidnight);

      await setItems([...items, { id, title, content, group_id, birthday }]); // 楽観的更新
      saveItem(user.id, { id, title, content, group_id, birthday }).catch(error => {
        // 後で忘れるのでメモ： この .catch は jsランタイムに登録されるので、直後で onClose() をしてModalを閉じていても
        // エラーが発生した時点の画面で Alert が表示される。( Alertは、その時点のトップの画面の上にモーダルとして表示される)
        console.error('Failed to save item: ', error);
        Alert.alert('アイテムの保存に失敗しました', '時間をおいてもう一度お試しください。');
      });

      onClose(); // 自分で閉じる
      onSaved(); // 親に「保存完了」を通知
    } catch (e) {
      Alert.alert('エラー', '入力内容を確認してください');
      console.error(e);
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.createModalOverlay}>
          <TouchableWithoutFeedback
            onPress={() => {
              /* Modal内でのタップで閉じないようにする */
            }}
          >
            <View style={styles.createModalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <AntDesign name="closecircleo" size={24} color="#808080" />
              </TouchableOpacity>

              <View style={styles.saveButtonArea}>
                <Button title="保存" onPress={handleSave} />
              </View>

              <View style={styles.inputArea}>
                <KeyboardAvoidingView
                  behavior="padding"
                  keyboardVerticalOffset={100}
                  style={{ flex: 1 }}
                >
                  <ScrollView
                    ref={scrollViewRef}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContentContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardDismissMode="on-drag"
                    automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                  >
                    <ItemInputForm
                      title={title}
                      content={content}
                      onChangeTitle={setTitle}
                      onChangeContent={setContent}
                      onFocusContent={() => {
                        // Textareaフォーカス時に、入力欄がキーボードで隠れないよう下へスクロール
                        requestAnimationFrame(() =>
                          scrollViewRef.current?.scrollToEnd({ animated: true })
                        );
                      }}
                      onSelectGroup={() => setGroupModalVisible(true)}
                      selectedGroup={selectedGroup}
                      year={year}
                      month={month}
                      day={day}
                      setYear={setYear}
                      setMonth={setMonth}
                      setDay={setDay}
                      autoFocus={true}
                    />
                  </ScrollView>
                </KeyboardAvoidingView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
      {/* グループ選択Modal（ItemCreateModalの内部） */}
      {groupModalVisible && (
        <GroupSelectModal
          toggleGroupModal={() => setGroupModalVisible(false)}
          groups={groups}
          setSelectedGroup={setSelectedGroup}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  createModalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  createModalContent: {
    position: 'absolute',
    top: 80,
    width: '96%',
    bottom: 0,
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: '#000', // iOS用
    shadowOffset: { width: 0, height: 4 }, // iOS用
    shadowOpacity: 0.3, // iOS用
    shadowRadius: 8, // iOS用
    elevation: 10 // Android用
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 4
  },
  saveButtonArea: {
    position: 'absolute',
    top: 8,
    right: 12,
    padding: 4
  },
  inputArea: {
    marginTop: 20,
    flex: 1
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 24
  }
});

export default ItemCreateModal;
