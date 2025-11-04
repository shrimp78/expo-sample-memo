import React, { useState, useMemo } from 'react';
import { Input, InputField, Textarea, TextareaInput, Text, HStack } from '@gluestack-ui/themed';
import {
  InputAccessoryView,
  View,
  Platform,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import KeyboardCloseButton from '../common/KeyboardCloseButton';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Group } from '@models/Group';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { ITEM_TITLE_MAX_LENGTH, ITEM_CONTENT_MAX_LENGTH } from '@constants/validation';
import { changeAnnivFormat } from '@utils/annivFormatter';

type ItemInputFormProps = {
  title: string;
  content: string;
  onChangeTitle: (text: string) => void;
  onChangeContent: (text: string) => void;
  onSelectGroup: () => void;
  selectedGroup: Group | null;
  year: number;
  month: number;
  day: number;
  setYear: (year: number) => void;
  setMonth: (month: number) => void;
  setDay: (day: number) => void;
  autoFocus: boolean;
};

const inputAccessoryViewID1 = 'INPUT_ACCESSORY_VIEW_ID_1';
const inputAccessoryViewID2 = 'INPUT_ACCESSORY_VIEW_ID_2';

/**
 * アイテムの入力フォーム
 * @param props プロパティ
 * @returns アイテム入力フォーム
 */
const ItemInputForm: React.FC<ItemInputFormProps> = props => {
  const {
    title,
    content,
    onChangeTitle,
    onChangeContent,
    onSelectGroup,
    selectedGroup,
    year,
    month,
    day,
    setYear,
    setMonth,
    setDay,
    autoFocus
  } = props;

  // 日付選択エリアで使用するモノたち
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date(year, month - 1, day));

  // y,m,d の各numberを受け取って、YYYY/MM/DD のStringを返す
  const formatSelectedDate = (y: number, m: number, d: number): string => {
    if (!y || !m || !d) return '';
    const mm = String(m).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}/${mm}/${dd}`;
  };

  // YYMMDDの選択肢
  const years = useMemo(() => Array.from({ length: 101 }, (_, i) => 1970 + i), []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const daysInMonth = useMemo(() => new Date(Date.UTC(year, month, 0)).getUTCDate(), [year, month]);
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  // DatePickerの完了ボタン押下時の処理
  // DatePickerで変更されたtmpDateの値をy,m,d に設定してPickerを閉じる
  const handleConfirmDate = () => {
    const y = tempDate.getFullYear();
    const m = tempDate.getMonth() + 1;
    const d = tempDate.getDate();
    setYear(y);
    setMonth(m);
    setDay(d);
    setDatePickerOpen(false);
  };

  // 経過年数を表示
  const annivPreviewDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const formattedAnniv = changeAnnivFormat(annivPreviewDate);

  return (
    <View style={{ flex: 1, paddingBottom: 20 }}>
      {/* タイトル入力 */}
      <View style={styles.titleRow}>
        <Input borderWidth={0} style={styles.titleInput}>
          <InputField
            placeholder="タイトル"
            value={title}
            onChangeText={onChangeTitle}
            inputAccessoryViewID={inputAccessoryViewID1}
            fontSize={'$3xl'}
            fontWeight={'$bold'}
            editable={true}
            autoFocus={autoFocus}
            maxLength={ITEM_TITLE_MAX_LENGTH}
          />
        </Input>
      </View>
      {/* グループ選択エリア */}
      <HStack
        alignItems="center"
        paddingHorizontal={'$2'}
        marginTop={'$2'}
        marginBottom={'$1'}
        marginLeft={'$1'}
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
      {/* 年月日入力 iOSの場合は、ネイティブのホイールを出現させる */}
      {Platform.OS === 'ios' ? (
        <>
          <HStack
            alignItems="center"
            paddingHorizontal={'$2'}
            marginTop={'$2'}
            marginBottom={'$1'}
            marginLeft={'$0'}
            height={'$10'}
          >
            {/* カレンダーのアイコン */}
            <TouchableOpacity
              onPress={() => {
                setTempDate(new Date(year, month - 1, day));
                setDatePickerOpen(true);
              }}
              style={styles.datePickerButton}
            >
              <HStack alignItems="center" space="sm">
                <Feather name="calendar" size={22} color="#007AFF" />
                {/* 年月日を表示 */}
                <Text fontSize={'$lg'} fontWeight={'$medium'} color="#007AFF">
                  {formatSelectedDate(year, month, day) || '日付を選択'}
                </Text>
              </HStack>
            </TouchableOpacity>
            {/* 経過年数を表示 CreateModal用にnumberが0の場合は非表示 */}
            {formattedAnniv.number > 0 && (
              <HStack alignItems="center" space="xs" marginLeft={'$4'}>
                <Text fontSize={'$lg'} fontWeight={'$medium'} color="#4A5054">
                  {formattedAnniv.number}
                </Text>
                <Text fontSize={'$lg'} fontWeight={'$medium'} color="#4A5054">
                  {formattedAnniv.unit}
                </Text>
              </HStack>
            )}
          </HStack>

          {/* iOS用の日付Pickerモーダル */}
          <Modal
            visible={isDatePickerOpen}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setDatePickerOpen(false)}
          >
            <View style={styles.datePickerOverlay}>
              <View style={styles.datePickerContent}>
                <View style={styles.datePickerHeader}>
                  <TouchableOpacity onPress={() => setDatePickerOpen(false)}>
                    <Text color="#007AFF" fontSize={'$md'}>
                      キャンセル
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleConfirmDate}>
                    <Text color="#007AFF" fontSize={'$md'}>
                      完了
                    </Text>
                  </TouchableOpacity>
                </View>
                <SafeAreaView>
                  <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="spinner"
                    onChange={(_, date) => {
                      if (date) setTempDate(date);
                    }}
                  />
                </SafeAreaView>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        // Androidの場合は既存のクソダサいピッカーを使用
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Picker selectedValue={year} onValueChange={setYear} style={{ flex: 1 }}>
            {years.map(y => (
              <Picker.Item key={y} label={`${y}`} value={y} />
            ))}
          </Picker>
          <Picker selectedValue={month} onValueChange={setMonth} style={{ flex: 1 }}>
            {months.map(m => (
              <Picker.Item key={m} label={`${m}`} value={m} />
            ))}
          </Picker>
          <Picker selectedValue={day} onValueChange={setDay} style={{ flex: 1 }}>
            {days.map(d => (
              <Picker.Item key={d} label={`${d}`} value={d} />
            ))}
          </Picker>
        </View>
      )}

      {/* 経過時間を表示 */}
      <View>
        <HStack></HStack>
      </View>
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
          maxLength={ITEM_CONTENT_MAX_LENGTH}
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

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 4
  },
  titleInput: {
    flex: 1
  },
  datePickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  datePickerContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 8
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  datePickerButton: {
    paddingVertical: 4,
    paddingHorizontal: 4
  }
});

export default ItemInputForm;
