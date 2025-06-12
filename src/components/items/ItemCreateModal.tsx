import {
  Modal,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  Button,
  KeyboardAvoidingView,
  StyleSheet,
  Text
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { ItemInputForm } from './ItemInputForm';
import { type Group } from '../types/group';

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
                <AntDesign name="closecircleo" size={24} color="gray" />
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
        <Modal animationType="fade" transparent={true}>
          <TouchableWithoutFeedback onPress={toggleGroupModal}>
            <View style={styles.groupModalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.groupModalContent}>
                  <TouchableOpacity style={styles.closeGroupModalButton} onPress={toggleGroupModal}>
                    <AntDesign name="closecircleo" size={24} color="gray" />
                  </TouchableOpacity>
                  <View style={styles.groupListContainer}>
                    {groups.map(group => (
                      <TouchableOpacity
                        key={group.id}
                        style={[styles.groupItem, { borderLeftColor: group.color }]}
                        onPress={() => {
                          console.log('グループが選択されました:', group.name);
                          toggleGroupModal();
                          setSelectedGroup(group);
                        }}
                      >
                        <Text style={styles.groupItemText}>{group.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
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
    backgroundColor: 'white',
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
  groupModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  groupModalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '85%',
    maxHeight: '70%',
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10
  },
  groupModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  groupItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderLeftWidth: 4,
    marginBottom: 5
  },
  groupItemText: {
    fontSize: 16,
    fontWeight: '500'
  },
  closeGroupModalButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 4
  },
  groupListContainer: {
    marginTop: 50
  }
});

export { ItemCreateModal };
