import React, { useState, useMemo } from 'react';
import {
  Input,
  InputField,
  Textarea,
  TextareaInput,
  Text,
  HStack,
  Box
} from '@gluestack-ui/themed';
import {
  View,
  Platform,
  TouchableOpacity,
  Switch,
  Modal,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import { Group } from '@models/Group';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { ITEM_TITLE_MAX_LENGTH, ITEM_CONTENT_MAX_LENGTH } from '@constants/validation';
import { changeBirthdayFormat } from '@utils/birthdayFormatter';

type ItemInputFormProps = {
  title: string;
  content: string;
  onChangeTitle: (text: string) => void;
  onChangeContent: (text: string) => void;
  onFocusContent?: () => void;
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
    onFocusContent,
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

  // 通知設定（UIのみ。永続化はまだ行わない TODO: DBと連携する）
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [notifyTiming, setNotifyTiming] = useState<string>('1h');

  const notifyTimingOptions: Array<{ id: string; label: string }> = [
    { id: '1h', label: '1時間前' },
    { id: '24h', label: '24時間前' },
    { id: '7d', label: '7日前' },
    { id: '14d', label: '14日前' },
    { id: '30d', label: '30日前' }
  ];

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
  const birthdayPreviewDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const formattedBirthday = changeBirthdayFormat(birthdayPreviewDate);

  return (
    <View>
      {/* タイトル入力 */}
      <View style={styles.titleRow}>
        <Input borderWidth={0} style={styles.titleInput}>
          <InputField
            placeholder="タイトル"
            value={title}
            onChangeText={onChangeTitle}
            fontSize={'$3xl'}
            fontWeight={'$bold'}
            editable={true}
            autoFocus={autoFocus}
            maxLength={ITEM_TITLE_MAX_LENGTH}
          />
        </Input>
      </View>

      {/* グループ選択エリア */}
      <View style={styles.sectionTitle}>
        <Text style={styles.sectionTitleText}>グループ</Text>
      </View>
      <HStack
        alignItems="center"
        marginTop={'$2'}
        marginBottom={'$2'}
        marginHorizontal={'$2'}
        height={'$10'}
      >
        <TouchableOpacity
          onPress={onSelectGroup}
          style={styles.selectionTouchable}
          activeOpacity={0.8}
        >
          <View style={styles.selectionSurface}>
            <HStack alignItems="center" space="sm">
              <Feather name="users" size={14} color="#8E8E93" />
              {selectedGroup ? (
                <>
                  <View style={[styles.groupColorDot, { backgroundColor: selectedGroup.color }]} />
                  <Text fontSize={'$sm'} fontWeight={'$medium'} color="#1C1C1E">
                    {selectedGroup.name}
                  </Text>
                </>
              ) : (
                <Text fontSize={'$sm'} fontWeight={'$medium'} color="#8E8E93">
                  グループを選択
                </Text>
              )}
            </HStack>
            <Feather name="chevron-down" size={14} color="#8E8E93" />
          </View>
        </TouchableOpacity>
      </HStack>

      {/* 年月日入力 iOSの場合は、ネイティブのホイールを出現させる */}
      <View style={styles.sectionTitle}>
        <Text style={styles.sectionTitleText}>日付</Text>
      </View>
      {Platform.OS === 'ios' ? (
        <>
          <HStack
            alignItems="center"
            marginTop={'$2'}
            marginBottom={'$2'}
            marginHorizontal={'$2'}
            height={'$10'}
          >
            {/* 日付選択ボタン領域 */}
            <TouchableOpacity
              onPress={() => {
                setTempDate(new Date(year, month - 1, day));
                setDatePickerOpen(true);
              }}
              style={styles.selectionTouchable}
              activeOpacity={0.8}
            >
              <View style={styles.selectionSurface}>
                <HStack alignItems="center" space="sm">
                  {/* カレンダーアイコン */}
                  <Feather name="calendar" size={14} color="#8E8E93" />
                  {/* 年月日 */}
                  <Text fontSize={'$sm'} fontWeight={'$medium'} color="#1C1C1E">
                    {formatSelectedDate(year, month, day) || '日付を選択'}
                  </Text>
                </HStack>
                {/* 下矢印 */}
                <Feather name="chevron-down" size={14} color="#8E8E93" />
              </View>
            </TouchableOpacity>
            {/* 経過年数を表示 CreateModal用にnumberが0の場合は非表示 */}
            {formattedBirthday.number > 0 && (
              <HStack alignItems="center" space="xs" marginLeft={'$4'}>
                <Text fontSize={'$lg'} fontWeight={'$medium'} color="#4A5054">
                  {formattedBirthday.number}
                </Text>
                <Text fontSize={'$lg'} fontWeight={'$medium'} color="#4A5054">
                  {formattedBirthday.unit}
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

      {/* 通知設定 */}
      <View style={styles.sectionTitle}>
        <Text style={styles.sectionTitleText}>通知設定</Text>
      </View>
      <HStack
        alignItems="center"
        marginTop={'$2'}
        marginBottom={notifyEnabled ? '$1' : '$2'}
        marginHorizontal={'$2'}
        height={'$10'}
      >
        <View style={styles.selectionSurface}>
          <HStack alignItems="center" space="sm">
            <Feather name="bell" size={14} color="#8E8E93" />
            <Text fontSize={'$sm'} fontWeight={'$medium'} color="#1C1C1E">
              通知設定
            </Text>
          </HStack>
          <Switch
            value={notifyEnabled}
            onValueChange={setNotifyEnabled}
            style={styles.notifySwitch}
            trackColor={{ false: '#D1D1D6', true: '#34C759' }}
            thumbColor={
              Platform.OS === 'android' ? (notifyEnabled ? '#FFFFFF' : '#FFFFFF') : undefined
            }
          />
        </View>
      </HStack>
      {notifyEnabled && (
        <View style={styles.notifyDetailContainer}>
          <Text style={styles.notifyDetailTitle}>通知タイミング</Text>
          <View style={styles.notifyOptionsSurface}>
            {notifyTimingOptions.map(option => {
              const isSelected = notifyTiming === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setNotifyTiming(option.id)}
                  activeOpacity={0.8}
                  style={[styles.notifyOptionRow, isSelected && styles.notifyOptionRowSelected]}
                >
                  <HStack alignItems="center" space="sm">
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text fontSize={'$sm'} fontWeight={'$medium'} color="#1C1C1E">
                      {option.label}
                    </Text>
                  </HStack>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* 内容入力 */}
      <View style={styles.sectionTitle}>
        <Text style={styles.sectionTitleText}>メモ</Text>
      </View>
      <Box marginTop={'$2'} marginHorizontal={'$2'}>
        <Textarea
          borderWidth={0}
          width={'$full'}
          height={150}
          maxHeight={200}
          style={styles.textAreaSurface}
        >
          <TextareaInput
            placeholder="メモ"
            value={content}
            scrollEnabled={true}
            onChangeText={onChangeContent}
            onFocus={onFocusContent}
            fontSize={'$md'}
            multiline={true}
            textAlignVertical="top"
            maxLength={ITEM_CONTENT_MAX_LENGTH}
            style={styles.textAreaInput}
          />
        </Textarea>
      </Box>
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
  sectionTitle: {
    marginTop: 14,
    marginBottom: 4,
    paddingHorizontal: 12
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'gray'
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
  textAreaSurface: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  textAreaInput: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0
  },
  selectionTouchable: {
    flex: 1
  },
  selectionSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: '100%'
  },
  groupColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  notifySwitch: {
    marginRight: 10
  },
  notifyDetailContainer: {
    marginHorizontal: 8,
    marginTop: 18,
    marginBottom: 8
  },
  notifyDetailTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
    marginBottom: 8
  },
  notifyOptionsSurface: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    overflow: 'hidden'
  },
  notifyOptionRow: {
    paddingVertical: 12,
    paddingHorizontal: 12
  },
  notifyOptionRowSelected: {
    backgroundColor: '#E9ECF5'
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioOuterSelected: {
    borderColor: '#2563EB'
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB'
  }
});

export default ItemInputForm;
