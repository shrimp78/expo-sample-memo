import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@context/AuthContext';
import { sortOptions, SortOptionId, DEFAULT_SORT_OPTION } from '@constants/sortOptions';
import { useUserPreferencesStore } from '@src/store/userPreferencesStore';

export default function SettingsScreen() {
  const { isLoggedIn, user } = useAuth();
  const itemSortOption = useUserPreferencesStore(state => state.itemSortOption);
  const isHydrated = useUserPreferencesStore(state => state.isHydrated);
  const isSaving = useUserPreferencesStore(state => state.isSaving);
  const hydrateFromCache = useUserPreferencesStore(state => state.hydrateFromCache);
  const updateItemSortOption = useUserPreferencesStore(state => state.updateItemSortOption);
  const currentSortOption = itemSortOption ?? DEFAULT_SORT_OPTION;

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
      </ScrollView>
    </SafeAreaView>
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
  }
});
