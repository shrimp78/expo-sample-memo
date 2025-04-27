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
      <Input>
        <InputField placeholder="タイトルを入力してください" value={title} onChangeText={onChangeTitle} />
      </Input>

      {/* 内容入力 */}
      <Textarea>
        <TextareaInput placeholder="内容を入力してください" value={content} onChangeText={onChangeContent} />
      </Textarea>
    </View>
  );
};

export { ItemInputForm };
