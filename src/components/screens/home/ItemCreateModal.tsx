import {
  Modal,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  Button,
  KeyboardAvoidingView,
  StyleSheet
} from 'react-native';
import GroupSelectModal from '../../common/GroupSelectModal';
import { AntDesign } from '@expo/vector-icons';
import ItemInputForm from '../../common/ItemInputForm';
import { type Group } from '../../types/Group';

type ItemCreateProps = {
  visible: boolean;
  toggleCreateModal: () => void;
  onSave: () => void;
  onChangeTitle: (text: string) => void;
  onChangeContent: (text: string) => void;
  onSelectGroup: () => void;
  title: string;
  content: string;
  groupModalVisible: boolean;
  toggleGroupModal: () => void;
  groups: Group[];
  selectedGroup: Group | null;
  setSelectedGroup: (group: Group | null) => void;
};

const ItemCreateModal: React.FC<ItemCreateProps> = props => {
  const {
    visible,
    toggleCreateModal,
    onSave,
    onChangeTitle,
    onChangeContent,
    onSelectGroup,
    title,
    content,
    groupModalVisible,
    toggleGroupModal,
    groups,
    selectedGroup,
    setSelectedGroup
  } = props;
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={toggleCreateModal}
    >
      <TouchableWithoutFeedback onPress={toggleCreateModal}>
        <View style={styles.createModalOverlay}>
          <TouchableWithoutFeedback
            onPress={() => {
              /* Modal内でのタップで閉じないようにする */
            }}
          >
            <View style={styles.createModalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={toggleCreateModal}>
                <AntDesign name="closecircleo" size={24} color="#808080" />
              </TouchableOpacity>
              <View style={styles.saveButtonArea}>
                <Button title="保存" onPress={onSave} />
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
                    onChangeTitle={onChangeTitle}
                    onChangeContent={onChangeContent}
                    onSelectGroup={onSelectGroup}
                    selectedGroup={selectedGroup}
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
          toggleGroupModal={toggleGroupModal}
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
