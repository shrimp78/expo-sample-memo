import { Input, InputField, Textarea, TextareaInput } from '@gluestack-ui/themed';
import { InputAccessoryView, View, Platform, Keyboard, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type ItemInputFormProps = {
  title: string;
  content: string;
  onChangeTitle: (text: string) => void;
  onChangeContent: (text: string) => void;
};

const inputAccessoryViewID = 'INPUT_ACCESSORY_VIEW_ID';

/**
 * アイテムの入力フォーム
 * @param props プロパティ
 * @returns アイテム入力フォーム
 */
const ItemInputForm: React.FC<ItemInputFormProps> = props => {
  const { title, content, onChangeTitle, onChangeContent } = props;

  return (
    <View style={{ flex: 1, paddingBottom: 100 }}>
      {/* タイトル入力 */}
      <Input borderWidth={0} minWidth={'$full'} marginTop={'$4'} marginBottom={'$1'}>
        <InputField
          placeholder="タイトルを入力してください"
          value={title}
          onChangeText={onChangeTitle}
          fontSize={'$2xl'}
          fontWeight={'$bold'}
          editable={true}
        />
      </Input>

      {/* 内容入力 */}
      <Textarea borderWidth={0} minWidth={'$full'} minHeight={'$full'}>
        <TextareaInput
          placeholder="内容を入力してください"
          value={content}
          scrollEnabled={true}
          onChangeText={onChangeContent}
          inputAccessoryViewID={inputAccessoryViewID}
          paddingHorizontal={'$5'}
          fontSize={'$md'}
        />
      </Textarea>

      {/* iOSのみキーボードの閉じるボタンを表示 */}
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={inputAccessoryViewID} backgroundColor={'#F1F1F1'}>
          <View style={{ alignItems: 'flex-end', padding: 8 }}>
            <TouchableOpacity onPress={() => Keyboard.dismiss()}>
              <MaterialIcons name="keyboard-hide" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </View>
  );
};

export { ItemInputForm };
