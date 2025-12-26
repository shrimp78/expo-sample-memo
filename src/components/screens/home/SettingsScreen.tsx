import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Linking,
  Switch
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, useAuthenticatedUser } from '@context/AuthContext';
import { sortOptions, SortOptionId, DEFAULT_SORT_OPTION } from '@constants/sortOptions';
import { useUserPreferencesStore } from '@src/store/userPreferencesStore';
import { deleteAllItems } from '@services/itemService';
import { deleteAllGroups } from '@services/groupService';
import { subscribeToNotificationPermissionChange } from '@services/notificationService';
import ActivityIndicatorModal from '@components/common/ActivityIndicatorModal';

export default function SettingsScreen() {
  const user = useAuthenticatedUser();
  const { isLoggedIn } = useAuth();
  const itemSortOption = useUserPreferencesStore(state => state.itemSortOption);
  const isHydrated = useUserPreferencesStore(state => state.isHydrated);
  const isSaving = useUserPreferencesStore(state => state.isSaving);
  const hydrateFromCache = useUserPreferencesStore(state => state.hydrateFromCache);
  const updateItemSortOption = useUserPreferencesStore(state => state.updateItemSortOption);
  const currentSortOption = itemSortOption ?? DEFAULT_SORT_OPTION;
  const [isLoading, setIsLoading] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState<boolean | null>(null);
  const insets = useSafeAreaInsets();

  // 通知権限状態の監視
  useEffect(() => {
    const subscription = subscribeToNotificationPermissionChange(setHasNotificationPermission);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/');
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (user?.id && !isHydrated) {
      void hydrateFromCache(user.id);
    }
  }, [user?.id, isHydrated, hydrateFromCache]);

  // 並び順選択ボタン処理
  const handleSelectOption = (optionId: SortOptionId) => {
    if (!user?.id || isSaving || optionId === currentSortOption) {
      return;
    }

    updateItemSortOption(user.id, optionId).catch(() => {
      Alert.alert('エラー', '並び順の保存に失敗しました。時間をおいて再度お試しください。');
    });
  };

  if (!isLoggedIn) {
    return null;
  }

  // 通知設定の開く導線
  const handleOpenNotificationSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      Alert.alert('エラー', '通知設定を開けませんでした');
      console.error(error);
    }
  };

  // 通知のトグル処理（TODO：明日ここの処理を読んでいく）
  const handleToggleNotification = async (value: boolean) => {
    if (value) {
      // ONにしようとした場合
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('通知設定', '通知を有効にするには、設定画面から通知を許可してください。', [
          { text: 'キャンセル', style: 'cancel' },
          { text: '設定を開く', onPress: handleOpenNotificationSettings }
        ]);
      }
    } else {
      // OFFにしようとした場合
      Alert.alert('通知設定', '通知を無効にするには、設定画面から通知をオフにしてください。', [
        { text: 'キャンセル', style: 'cancel' },
        { text: '設定を開く', onPress: handleOpenNotificationSettings }
      ]);
    }
  };

  // 全削除ボタン処理
  const deleteExecute = async () => {
    setIsLoading(true);
    try {
      await deleteAllItems(user.id);
      await deleteAllGroups(user.id);
    } catch (error) {
      Alert.alert('エラー', '削除に失敗しました');
      console.error(error);
    } finally {
      setIsLoading(false);
      router.replace('/');
    }
  };

  const handleDeleteAllPress = async () => {
    console.log('全てのアイテムを削除するが押されました');
    Alert.alert('確認', '全てのアイテムを削除しますか？', [
      {
        text: 'キャンセル',
        style: 'cancel'
      },
      { text: '削除', onPress: () => deleteExecute() }
    ]);
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: styles.scrollContent.paddingBottom + insets.bottom }
        ]}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ホーム画面の並び順</Text>
          <Text style={styles.sectionSubtitle}>
            グループの中のアイテムの並び順を選択してください。
            グループ自体の並び順は、グループ設定画面で自由に並び替える事ができます。
          </Text>
          <View style={styles.optionList}>
            {sortOptions.map(option => {
              const isSelected = currentSortOption === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => handleSelectOption(option.id)}
                  disabled={isSaving && !isSelected}
                  style={({ pressed }) => [
                    styles.optionItem,
                    isSelected && styles.optionItemSelected,
                    pressed && styles.optionItemPressed
                  ]}
                >
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                      {option.label}
                    </Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                  <View
                    style={[styles.optionIndicator, isSelected && styles.optionIndicatorSelected]}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知設定</Text>
          <Text style={styles.sectionSubtitle}>
            通知をONにすると、Itemの通知を受け取れるようになります。
          </Text>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>通知を受け取る</Text>
            <Switch
              value={hasNotificationPermission === true}
              onValueChange={handleToggleNotification}
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor={'#FFFFFF'}
              disabled={hasNotificationPermission === null}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アイテムの削除</Text>
          <Text style={styles.sectionSubtitle}>
            全てのアイテムを一括で削除する事ができます。
            この操作は取り消すことができませんのでご注意ください。
          </Text>
          <Pressable
            onPress={handleDeleteAllPress}
            style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}
          >
            <Text style={styles.deleteButtonText}>全てのアイテムを削除する</Text>
          </Pressable>
        </View>
      </ScrollView>
      <ActivityIndicatorModal isLoading={isLoading} loadingText="削除中..." />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A'
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    marginBottom: 12
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 8
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A'
  },
  optionList: {
    gap: 12
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  optionItemSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB'
  },
  optionItemPressed: {
    opacity: 0.85
  },
  optionTextContainer: {
    flex: 1,
    paddingRight: 16
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A'
  },
  optionLabelSelected: {
    color: '#1D4ED8'
  },
  optionDescription: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18
  },
  optionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5F5',
    backgroundColor: 'transparent'
  },
  optionIndicatorSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB'
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  deleteButtonPressed: {
    backgroundColor: '#FEE2E2',
    opacity: 0.9
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600'
  }
});
