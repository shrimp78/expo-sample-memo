import { useState } from 'react';
import {
  Alert,
  Modal,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  Button,
  KeyboardAvoidingView,
  StyleSheet
} from 'react-native';
import * as Crypto from 'expo-crypto';
import { AntDesign } from '@expo/vector-icons';
import { Input, InputField } from '@gluestack-ui/themed';
import { GROUP_NAME_MAX_LENGTH } from '@constants/validation';
import { useGroups } from '@context/GroupContext';
import { saveGroup } from '@services/groupService';
import { useAuthenticatedUser } from '@context/AuthContext';
import GroupColorSelector from './GroupColorSelector';
import { colorOptions } from '@constants/colors';

type ItemCreateProps = {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
};

const ItemCreateModal: React.FC<ItemCreateProps> = ({ visible, onClose, onSaved }) => {
  const user = useAuthenticatedUser();
  const { groups, setGroups } = useGroups();
  const [groupName, setGroupName] = useState('');
  const [groupColor, setGroupColor] = useState(colorOptions[0]);

  // TODO: グループ名の入力が保存後にクリアされない
  // TODO: グループ名入力時に、キーボード閉じるボタンが出てない

  const handleSave = async () => {
    // バリデーション
    if (!groupName) {
      Alert.alert('確認', 'グループ名を入力してください');
      return;
    }
    if (!groupColor) {
      Alert.alert('確認', 'グループの色を選択してください');
      return;
    }

    // 保存処理
    try {
      const groupId = Crypto.randomUUID();
      // position を算出
      const newPosition =
        groups.length === 0 ? 65536 : Math.max(...groups.map(group => group.position)) + 65536;

      await setGroups([
        ...groups,
        { id: groupId, name: groupName, color: groupColor, position: newPosition }
      ]);
      saveGroup(user.id, groupId, groupName, groupColor).catch(error => {
        console.error('Failed to save group: ', error);
        Alert.alert('グループの保存に失敗しました', '時間をおいてもう一度お試しください。');
      });
      onClose();
      onSaved();
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
                  {/* グループ名入力 */}
                  <Input borderWidth={0} minWidth={'$full'} marginTop={'$8'} marginBottom={'$1'}>
                    <InputField
                      placeholder="グループ名"
                      value={groupName}
                      onChangeText={setGroupName}
                      fontSize={'$3xl'}
                      fontWeight={'$bold'}
                      editable={true}
                      autoFocus={true}
                      maxLength={GROUP_NAME_MAX_LENGTH}
                    />
                  </Input>

                  {/* カラーオプション */}
                  <GroupColorSelector groupColor={groupColor} onChangeGroupColor={setGroupColor} />
                </KeyboardAvoidingView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
  }
});

export default ItemCreateModal;
