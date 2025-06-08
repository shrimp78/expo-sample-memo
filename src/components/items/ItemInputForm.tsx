import {
  Input,
  InputField,
  Textarea,
  TextareaInput,
  Text,
  HStack,
  Button,
  ButtonText
} from '@gluestack-ui/themed';
import { InputAccessoryView, View, Platform, TouchableOpacity } from 'react-native';
import { KeyboardCloseButton } from './KeyboardCloseButton';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type ItemInputFormProps = {
  title: string;
  content: string;
  onChangeTitle: (text: string) => void;
  onChangeContent: (text: string) => void;
  onSelectGroup?: () => void; // グループ選択ボタンが押された時のコールバック
};

const inputAccessoryViewID1 = 'INPUT_ACCESSORY_VIEW_ID_1';
const inputAccessoryViewID2 = 'INPUT_ACCESSORY_VIEW_ID_2';

/**
 * アイテムの入力フォーム
 * @param props プロパティ
 * @returns アイテム入力フォーム
 */
const ItemInputForm: React.FC<ItemInputFormProps> = props => {
  const { title, content, onChangeTitle, onChangeContent, onSelectGroup } = props;

  return (
    <View style={{ flex: 1, paddingBottom: 20 }}>
      {/* タイトル入力 */}
      <Input borderWidth={0} minWidth={'$full'} marginTop={'$4'} marginBottom={'$1'}>
        <InputField
          placeholder="タイトルを入力してください"
          value={title}
          onChangeText={onChangeTitle}
          inputAccessoryViewID={inputAccessoryViewID1}
          fontSize={'$2xl'}
          fontWeight={'$bold'}
          editable={true}
        />
      </Input>

      {/* グループ選択エリア */}
      <HStack
        alignItems="center"
        paddingHorizontal={'$2'}
        paddingVertical={'$3'}
        marginTop={'$2'}
        marginBottom={'$2'}
        height={'$12'}
      >
        <Text fontSize={'$lg'} fontWeight={'$medium'} color="$gray">
          グループ
        </Text>
        <TouchableOpacity onPress={onSelectGroup}>
          <HStack alignItems="center" space="sm" marginLeft={'$4'}>
            <FontAwesome name="circle" size={24} color="#117A65" />
            <Text fontSize={'$lg'} fontWeight={'$medium'} color="#117A65">
              八ヶ岳
            </Text>
          </HStack>
        </TouchableOpacity>
      </HStack>

      {/* 内容入力 */}
      <Textarea borderWidth={0} flex={1} minWidth={'$full'} marginTop={'$2'}>
        <TextareaInput
          placeholder="内容を入力してください"
          value={content}
          scrollEnabled={true}
          onChangeText={onChangeContent}
          inputAccessoryViewID={inputAccessoryViewID2}
          paddingHorizontal={'$5'}
          fontSize={'$md'}
        />
      </Textarea>

      {/* iOSのみキーボードの閉じるボタンを表示 */}
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={inputAccessoryViewID1} backgroundColor={'#F1F1F1'}>
          <KeyboardCloseButton />
        </InputAccessoryView>
      )}
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={inputAccessoryViewID2} backgroundColor={'#F1F1F1'}>
          <KeyboardCloseButton />
        </InputAccessoryView>
      )}
    </View>
  );
};

export { ItemInputForm };
