import {
  Modal,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView
} from 'react-native';
import { Group } from '../types/group';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

type GroupSelectModalProps = {
  toggleGroupModal: () => void;
  groups: Group[];
  selectedGroup: Group | null;
  setSelectedGroup: (group: Group | null) => void;
};

const GroupSelectModal: React.FC<GroupSelectModalProps> = props => {
  const { toggleGroupModal, groups, setSelectedGroup, selectedGroup } = props;

  return (
    <Modal animationType="fade" transparent={true}>
      <TouchableWithoutFeedback onPress={toggleGroupModal}>
        <View style={styles.groupModalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.groupModalContent}>
              <TouchableOpacity style={styles.closeGroupModalButton} onPress={toggleGroupModal}>
                <AntDesign name="closecircleo" size={24} color="#808080" />
              </TouchableOpacity>
              <View style={styles.groupListContainer}>
                <ScrollView showsVerticalScrollIndicator={true}>
                  {groups.map(group => (
                    <TouchableOpacity
                      key={group.id}
                      style={styles.groupItem}
                      onPress={() => {
                        console.log('グループが選択されました:', group.name);
                        toggleGroupModal();
                        setSelectedGroup(group);
                      }}
                    >
                      <FontAwesome name="circle" size={24} color={group.color} />
                      <Text style={styles.groupItemText}>{group.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  groupModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  groupModalContent: {
    backgroundColor: '#ffffff',
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
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
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

export default GroupSelectModal;
