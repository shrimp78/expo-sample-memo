import { Input, InputField, Textarea, TextareaInput, Text } from '@gluestack-ui/themed';
import { InputAccessoryView, View, Platform } from 'react-native';
import { KeyboardCloseButton } from './KeyboardCloseButton';

type ItemInputFormProps = {
  title: string;
  content: string;
  onChangeTitle: (text: string) => void;
  onChangeContent: (text: string) => void;
};

const inputAccessoryViewID1 = 'INPUT_ACCESSORY_VIEW_ID_1';
const inputAccessoryViewID2 = 'INPUT_ACCESSORY_VIEW_ID_2';

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
          inputAccessoryViewID={inputAccessoryViewID1}
          fontSize={'$2xl'}
          fontWeight={'$bold'}
          editable={true}
        />
      </Input>

      <Text
        color="$red500"
        minHeight={'$full'}
        fontSize="$md"
        backgroundColor="$yellow100"
        padding="$4"
        onLayout={event => {
          console.log('Text component layout:', event.nativeEvent.layout);
        }}
      >
        グループ
      </Text>

      {/* 内容入力 */}
      <View style={{ flex: 1 }}>
        <Textarea
          borderWidth={0}
          minHeight={'$full'}
          minWidth={'$full'}
          marginTop={'$2'}
          backgroundColor="$red500"
        >
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
    </View>
  );
};

export { ItemInputForm };
