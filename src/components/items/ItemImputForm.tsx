import { Input, InputField, Textarea, TextareaInput } from '@gluestack-ui/themed';
import { Button, InputAccessoryView, View } from 'react-native';

type ItemInputFormProps = {
  title: string;
  content: string;
  onChangeTitle: (text: string) => void;
  onChangeContent: (text: string) => void;
};

/**
 * アイテムの入力フォーム
 * @param props プロパティ
 * @returns アイテム入力フォーム
 */
const ItemInputForm: React.FC<ItemInputFormProps> = props => {
  const { title, content, onChangeTitle, onChangeContent } = props;

  return (
    <View>
      {/* タイトル入力 */}
      <Input borderWidth={0} minWidth={'$full'} marginTop={'$4'} marginBottom={'$1'}>
        <InputField placeholder="タイトルを入力してください" value={title} onChangeText={onChangeTitle} fontSize={'$2xl'} fontWeight={'$bold'} />
      </Input>

      {/* 内容入力 */}
      <Textarea borderWidth={0} minWidth={'$full'} minHeight={'$full'}>
        <TextareaInput
          placeholder="内容を入力してください"
          value={content}
          scrollEnabled={true}
          onChangeText={onChangeContent}
          paddingHorizontal={'$5'}
          fontSize={'$md'}
        />
      </Textarea>
    </View>
  );
};

export { ItemInputForm };
