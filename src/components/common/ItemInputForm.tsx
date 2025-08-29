import React from 'react';
import { Input, InputField, Textarea, TextareaInput, Text, HStack } from '@gluestack-ui/themed';
import { InputAccessoryView, View, Platform, TouchableOpacity } from 'react-native';
import KeyboardCloseButton from '../common/KeyboardCloseButton';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Group } from '@models/Group';

type ItemInputFormProps = {
  title: string;
  content: string;
  onChangeTitle: (text: string) => void;
  onChangeContent: (text: string) => void;
  onSelectGroup: () => void;
  selectedGroup: Group | null;
};

const inputAccessoryViewID1 = 'INPUT_ACCESSORY_VIEW_ID_1';
const inputAccessoryViewID2 = 'INPUT_ACCESSORY_VIEW_ID_2';

/**
 * アイテムの入力フォーム
 * @param props プロパティ
 * @returns アイテム入力フォーム
 */
const ItemInputForm: React.FC<ItemInputFormProps> = props => {
  const { title, content, onChangeTitle, onChangeContent, onSelectGroup, selectedGroup } = props;

  return (
    <View style={{ flex: 1, paddingBottom: 20 }}>
      {/* タイトル入力 */}
      <Input borderWidth={0} minWidth={'$full'} marginTop={'$8'} marginBottom={'$1'}>
        <InputField
          placeholder="タイトル"
          value={title}
          onChangeText={onChangeTitle}
          inputAccessoryViewID={inputAccessoryViewID1}
          fontSize={'$3xl'}
          fontWeight={'$bold'}
          editable={true}
          autoFocus={true}
        />
      </Input>

      {/* グループ選択エリア */}
      <HStack
        alignItems="center"
        paddingHorizontal={'$2'}
        marginTop={'$2'}
        marginBottom={'$1'}
        marginLeft={'$2'}
        height={'$10'}
      >
        <TouchableOpacity onPress={onSelectGroup}>
          <HStack alignItems="center" space="sm">
            {selectedGroup ? (
              <>
                <FontAwesome name="circle" size={24} color={selectedGroup.color} />
                <Text fontSize={'$lg'} fontWeight={'$medium'} color={selectedGroup.color}>
                  {selectedGroup.name}
                </Text>
              </>
            ) : (
              <>
                <FontAwesome name="circle" size={24} color="#808080" />
                <Text fontSize={'$lg'} fontWeight={'$medium'} color="$gray">
                  グループ
                </Text>
              </>
            )}
          </HStack>
        </TouchableOpacity>
      </HStack>

      {/* 内容入力 */}
      <Textarea
        borderWidth={0}
        flex={1}
        minWidth={'$full'}
        minHeight={300}
        marginTop={'$2'}
        paddingHorizontal={'$2'}
      >
        <TextareaInput
          placeholder="メモ"
          value={content}
          scrollEnabled={true}
          onChangeText={onChangeContent}
          inputAccessoryViewID={inputAccessoryViewID2}
          fontSize={'$md'}
          multiline={true}
          textAlignVertical="top"
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

export default ItemInputForm;
