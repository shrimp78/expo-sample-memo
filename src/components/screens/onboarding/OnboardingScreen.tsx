import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth, useAuthenticatedUser } from '@context/AuthContext';
import { updateUserById } from '@services/userService';
import { ONBOARDING_VERSION } from '@constants/onboarding';
import GroupCreateModal from '@screens/groups/GroupCreateModal';
import ItemCreateModal from '@screens/home/ItemCreateModal';
import { useGroups } from '@context/GroupContext';
import { useItems } from '@context/ItemContext';
import { getAllItemsByUserId } from '@services/itemService';
import { registerForPushNotificationsAsync } from '@services/notificationService';

type Step = 1 | 2 | 3 | 4 | 5;
const TOTAL_STEPS = 5;

type Props = {
  /**
   * 開発中のプレビュー用
   * trueの場合はUserのonboardingVersionを更新しない
   */
  previewMode?: boolean;
};

export default function OnboardingScreen({ previewMode = false }: Props) {
  const { user } = useAuth();
  const authedUser = useAuthenticatedUser();
  const { loadGroups } = useGroups();
  const { setItems } = useItems();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>(1);

  // Group modal state
  const [groupCreateModalVisible, setGroupCreateModalVisible] = useState(false);

  // Item modal state
  const [itemCreateModalVisible, setItemCreateModalVisible] = useState(false);

  const finishOnboarding = async () => {
    try {
      if (!user) return;
      if (!previewMode) {
        await updateUserById(user.id, { onboardingVersion: ONBOARDING_VERSION });
      }
    } catch (e) {
      console.warn('onboardingVersion 更新に失敗しましたが続行します', e);
    } finally {
      router.replace('/home');
    }
  };

  const handleSkip = () => {
    finishOnboarding();
  };

  // Step 2 helpers (Group)
  const openGroupFlow = () => {
    // オーバーレイはOKで閉じたまま、作成モーダルのみ開く
    console.log('openGroupFlow');
    setGroupCreateModalVisible(true);
  };
  const handleGroupSaved = async () => {
    await loadGroups();
    setStep(3);
  };

  // Step 3 helpers (Item)
  const openItemFlow = () => {
    // オーバーレイはOKで閉じたまま、作成モーダルのみ開く
    setItemCreateModalVisible(true);
  };
  const handleItemSaved = async () => {
    const items = await getAllItemsByUserId(authedUser.id);
    setItems(items);
    setStep(4);
  };

  // Step 4 : 通知許可
  const handleRequestNotification = async () => {
    const token = await registerForPushNotificationsAsync();
    if (token && user) {
      // 既存のTokenを取得し存在しない場合は追加
      const currentTokens = user.expoPushTokens || [];
      if (!currentTokens.includes(token)) {
        const updateTokens = [...currentTokens, token];
        await updateUserById(user.id, { expoPushTokens: updateTokens });
      }
    }
    setStep(5);
  };

  const canGoBack = step > 1 && step < 5 && !groupCreateModalVisible && !itemCreateModalVisible;

  const TopBar = () => (
    <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topBarSide}>
        {canGoBack ? (
          <TouchableOpacity
            onPress={() => setStep(prev => (prev > 1 ? ((prev - 1) as Step) : prev))}
            style={styles.topBarIconButton}
            accessibilityRole="button"
            accessibilityLabel="戻る"
          >
            <Feather name="chevron-left" size={22} color={stylesVars.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.topBarPlaceholder} />
        )}
      </View>
      <View style={styles.topBarSideRight}>
        <View style={styles.topBarPlaceholder} />
      </View>
    </View>
  );

  const StepDots = ({ current }: { current: number }) => (
    <View style={styles.dotsRow} accessibilityLabel={`ステップ ${current} / ${TOTAL_STEPS}`}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
        const active = i + 1 === current;
        return <View key={i} style={[styles.dot, active && styles.dotActive]} />;
      })}
    </View>
  );

  const PrimaryCta = ({
    label,
    onPress
  }: {
    label: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={styles.primaryCta}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.primaryCtaText}>{label}</Text>
    </TouchableOpacity>
  );

  const SecondaryLink = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <TouchableOpacity
      style={styles.secondaryLink}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.secondaryLinkText}>{label}</Text>
    </TouchableOpacity>
  );

  const Page = ({
    iconName,
    title,
    body,
    note,
    primaryLabel,
    primaryPress,
    secondaryLabel,
    secondaryPress
  }: {
    iconName: React.ComponentProps<typeof Feather>['name'];
    title: string;
    body: string;
    note?: string;
    primaryLabel: string;
    primaryPress: () => void;
    secondaryLabel?: string;
    secondaryPress?: () => void;
  }) => (
    <View style={styles.page}>
      <TopBar />
      <View style={styles.pageContent}>
        <View style={styles.illustrationWrap}>
          <View style={styles.illustrationCircle}>
            <Feather name={iconName} size={32} color={stylesVars.primary} />
          </View>
        </View>
        <Text style={styles.pageTitle}>{title}</Text>
        <Text style={styles.pageBody}>{body}</Text>
        {note ? <Text style={styles.pageNote}>{note}</Text> : null}
      </View>

      <View style={[styles.bottomArea, { paddingBottom: 18 + insets.bottom }]}>
        <PrimaryCta label={primaryLabel} onPress={primaryPress} />
        {secondaryLabel && secondaryPress ? (
          <SecondaryLink label={secondaryLabel} onPress={secondaryPress} />
        ) : null}
        <StepDots current={step} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {step === 1 && (
        <Page
          iconName="star"
          title="ようこそ！"
          body="まず最初のグループを作成してみましょう。"
          note="※あとから設定画面でいつでも確認できます。"
          primaryLabel="次へ"
          primaryPress={() => setStep(2)}
          secondaryLabel="あとで"
          secondaryPress={handleSkip}
        />
      )}

      {step === 2 && (
        <View style={{ flex: 1 }}>
          <Page
            iconName="folder"
            title="最初のグループを作成"
            body="グループ名を入力して、好きなカラーを選んで保存してください。"
            primaryLabel="グループを作成する"
            primaryPress={openGroupFlow}
            secondaryLabel="あとで"
            secondaryPress={handleSkip}
          />
          <GroupCreateModal
            visible={groupCreateModalVisible}
            onClose={() => setGroupCreateModalVisible(false)}
            onSaved={handleGroupSaved}
            dismissable={false}
          />
        </View>
      )}

      {step === 3 && (
        <View style={{ flex: 1 }}>
          <Page
            iconName="plus-circle"
            title="最初のアイテムを作成"
            body="アイテム名と説明文を入力し、グループを選択して保存してください。"
            primaryLabel="アイテムを作成する"
            primaryPress={openItemFlow}
            secondaryLabel="あとで"
            secondaryPress={handleSkip}
          />
          <ItemCreateModal
            visible={itemCreateModalVisible}
            onClose={() => setItemCreateModalVisible(false)}
            onSaved={handleItemSaved}
            dismissable={false}
          />
        </View>
      )}

      {step === 4 && (
        <Page
          iconName="bell"
          title="通知を受け取りますか？"
          body="誕生日が近づくとPush通知でお知らせします。"
          primaryLabel="通知をオンにする"
          primaryPress={handleRequestNotification}
          secondaryLabel="あとで"
          secondaryPress={() => setStep(5)}
        />
      )}

      {step === 5 && (
        <Page
          iconName="check"
          title="DONE！"
          body="最初のアイテムが完成しました。"
          note="グループやアイテムはいつでも編集画面から修正できます。"
          primaryLabel="はじめる"
          primaryPress={finishOnboarding}
        />
      )}
    </View>
  );
}

const stylesVars = {
  bg: '#F6F7FB',
  card: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  primary: '#0EA5E9',
  primaryDark: '#0284C7',
  dotInactive: '#E2E8F0'
} as const;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: stylesVars.bg
  },
  page: {
    flex: 1
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8
  },
  topBarSide: {
    minWidth: 80,
    alignItems: 'flex-start'
  },
  topBarSideRight: {
    minWidth: 80,
    alignItems: 'flex-end'
  },
  topBarIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)'
  },
  topBarPlaceholder: {
    width: 40,
    height: 40
  },
  skipButton: {
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  skipButtonText: {
    color: stylesVars.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6
  },
  pageContent: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  illustrationWrap: {
    marginBottom: 18
  },
  illustrationCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: stylesVars.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: stylesVars.textPrimary,
    textAlign: 'center'
  },
  pageBody: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: stylesVars.textSecondary,
    textAlign: 'center'
  },
  pageNote: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 18,
    color: stylesVars.textMuted,
    textAlign: 'center'
  },
  bottomArea: {
    paddingHorizontal: 22,
    paddingTop: 10
  },
  primaryCta: {
    backgroundColor: stylesVars.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: stylesVars.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2
  },
  secondaryLink: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8
  },
  secondaryLinkText: {
    color: stylesVars.textMuted,
    fontSize: 13,
    fontWeight: '700'
  },
  dotsRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: stylesVars.dotInactive
  },
  dotActive: {
    width: 18,
    backgroundColor: stylesVars.primary
  }
});
