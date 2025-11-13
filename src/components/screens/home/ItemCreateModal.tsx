import { useState, useEffect } from 'react';
import {
  Modal,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  Button,
  KeyboardAvoidingView,
  StyleSheet,
  Alert
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

    try {
      const id = Crypto.randomUUID();
      const group_id = selectedGroup.id;
      const utcMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      const anniv = Timestamp.fromDate(utcMidnight);

      await setItems([...items, { id, title, content, group_id, anniv }]);
      void saveItem(user.id, { id, title, content, group_id, anniv });
      onClose(); // 自分で閉じる
      onSaved(); // 親に「保存完了」を通知
    } catch (e) {
      Alert.alert('エラー', '保存に失敗しました');
      console.error(e);
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      {/* <= この onClose って何入ってるんだっけ。。 */}
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
                  <ItemInputForm
                    title={title}
                    content={content}
                    onChangeTitle={setTitle}
                    onChangeContent={setContent}
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
    top: 80, // TODO: これ、デバイスによって違うので、デバイスの高さによって変える必要がある
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
  }
});

export default ItemCreateModal;
