import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { useAuth, useAuthenticatedUser } from '@context/AuthContext';

type SortOption = {
  id: string;
  label: string;
  description: string;
};

const sortOptions: SortOption[] = [
  {
    id: 'title-asc',
    label: 'タイトル A → Z',
    description: 'タイトルをアルファベット順（昇順）で表示します。'
  },
  {
    id: 'title-desc',
    label: 'タイトル Z → A',
    description: 'タイトルをアルファベット順（降順）で表示します。'
  },
  {
    id: 'anniv-asc',
    label: 'Anniv 昇順',
    description: 'Anniv が早いものから順番に表示します。'
  },
  {
    id: 'anniv-desc',
    label: 'Anniv 降順',
    description: 'Anniv が遅いものから順番に表示します。'
  }
];

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { isLoggedIn } = useAuth();
  const user = useAuthenticatedUser();
  const [selectedSortOption, setSelectedSortOption] = useState<string>('title-asc');

  useEffect(() => {
    navigation.setOptions({
      headerTitle: '設定',
      headerBackTitle: '戻る',
      headerLeft: () => (
        <Pressable style={styles.headerBackButton} onPress={() => router.back()}>
          <Text style={styles.headerBackText}>戻る</Text>
        </Pressable>
      )
    });
  }, [navigation]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/');
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.greetingCard}>
          <Text style={styles.greetingTitle}>こんにちは</Text>
          <Text style={styles.greetingName}>{user.name} さん</Text>
          <Text style={styles.greetingDescription}>
            ホーム画面の表示に関する設定をこちらから管理できます。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ホーム画面の並び順</Text>
          <Text style={styles.sectionSubtitle}>好みの表示順を選択してください。</Text>
          <View style={styles.optionList}>
            {sortOptions.map(option => {
              const isSelected = selectedSortOption === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setSelectedSortOption(option.id)}
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
  greetingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4
  },
  greetingTitle: {
    fontSize: 14,
    color: '#64748B',
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  },
  greetingName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6
  },
  greetingDescription: {
    fontSize: 15,
    color: '#475569',
    marginTop: 12,
    lineHeight: 22
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
  },
  headerBackButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#EEF2FF'
  },
  headerBackText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D4ED8'
  }
});
