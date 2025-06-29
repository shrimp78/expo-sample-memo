import {
  Modal,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  Button,
  KeyboardAvoidingView,
  StyleSheet
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Input, InputField, Text, HStack } from '@gluestack-ui/themed';

type ItemCreateProps = {
  visible: boolean;
  toggleCreateModal: () => void;
  onSave: () => void;
  onChangeGroupName: (text: string) => void;
  groupName: string;
  groupColor: string;
  onChangeGroupColor?: (color: string) => void;
};

// グループカラーのプリセット
const colorOptions = [
  '#C0392B', // 赤
  '#2E86C1', // 青
  '#5DADE2', // 水色
  '#117A65', // 緑
  '#58D68D', // 黄緑
  '#E67E22', // オレンジ
  '#F8C471', // 黄
  '#E91E63', // ピンク
  '#8E44AD', // 紫
  '#85929E', // グレー
  '#2C3E50' // 黒
];

const ItemCreateModal: React.FC<ItemCreateProps> = props => {
  const {
    visible,
    toggleCreateModal,
    onSave,
    onChangeGroupName,
    groupName,
    groupColor,
    onChangeGroupColor
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
                  {/* グループ名入力 */}
                  <Input borderWidth={0} minWidth={'$full'} marginTop={'$8'} marginBottom={'$1'}>
                    <InputField
                      placeholder="グループ名"
                      value={groupName}
                      onChangeText={onChangeGroupName}
                      fontSize={'$3xl'}
                      fontWeight={'$bold'}
                      editable={true}
                    />
                  </Input>

                  {/* グループカラー選択エリア */}
                  <HStack
                    alignItems="center"
                    paddingHorizontal={'$2'}
                    marginTop={'$4'}
                    marginBottom={'$1'}
                    marginLeft={'$2'}
                    height={'$10'}
                  >
                    <FontAwesome name="circle" size={24} color={groupColor} />
                    <Text
                      fontSize={'$lg'}
                      fontWeight={'$medium'}
                      color={groupColor}
                      paddingLeft={'$2'}
                    >
                      カラー
                    </Text>
                  </HStack>

                  {/* カラーオプション */}
                  <View style={styles.colorOptionsContainer}>
                    <HStack flexWrap="wrap" space="md" paddingHorizontal={'$2'} marginLeft={'$2'}>
                      {colorOptions.map(color => (
                        <TouchableOpacity
                          key={color}
                          onPress={() => onChangeGroupColor?.(color)}
                          style={[
                            styles.colorOption,
                            groupColor === color && styles.selectedColorOption
                          ]}
                        >
                          <FontAwesome name="circle" size={32} color={color} />
                        </TouchableOpacity>
                      ))}
                    </HStack>
                  </View>
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
  colorOptionsContainer: {
    marginTop: 16,
    paddingBottom: 20
  },
  colorOption: {
    padding: 8,
    borderRadius: 20,
    marginBottom: 8
  },
  selectedColorOption: {
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  }
});

export default ItemCreateModal;
