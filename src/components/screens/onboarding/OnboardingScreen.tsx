import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth, useAuthenticatedUser } from '@context/AuthContext';
import { updateUserById } from '@services/userService';
import { ONBOARDING_VERSION } from '@constants/onboarding';
import GroupCreateModal from '@screens/groups/GroupCreateModal';
import ItemCreateModal from '@screens/home/ItemCreateModal';
import { useGroups } from '@context/GroupContext';
import { useItems } from '@context/ItemContext';
import { getAllItemsByUserId } from '@services/itemService';

type Step = 1 | 2 | 3 | 4;

export default function OnboardingScreen() {
  const { user } = useAuth();
  const authedUser = useAuthenticatedUser();
  const { loadGroups } = useGroups();
  const { setItems } = useItems();

  const [step, setStep] = useState<Step>(1);
  const [overlayVisible, setOverlayVisible] = useState<boolean>(true);

  // Group modal state
  const [groupCreateModalVisible, setGroupCreateModalVisible] = useState(false);

  // Item modal state
  const [itemCreateModalVisible, setItemCreateModalVisible] = useState(false);

  const finishOnboarding = async () => {
    try {
      if (!user) return;
      await updateUserById(user.id, { onboardingVersion: ONBOARDING_VERSION });
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
    setOverlayVisible(true); // Step3の説明を表示
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

  // Overlays for instruction text
  const InstructionOverlay = ({ text, onOk }: { text: string; onOk: () => void }) => {
    if (!overlayVisible) return null;
    return (
      <View style={styles.overlayContainer} pointerEvents="box-none">
        <View style={styles.overlayWrap}>
          <View style={styles.overlayCard}>
            <Text style={styles.overlayText}>{text}</Text>
            <TouchableOpacity
              style={styles.overlayOk}
              onPress={() => {
                setOverlayVisible(false);
                setTimeout(onOk, 0);
              }}
            >
              <Text style={styles.overlayOkText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {step === 1 && (
        <View style={styles.centerContent}>
          <Text style={styles.title}>ようこそ！</Text>
          <Text style={[styles.body, { marginTop: 16 }]}>
            まず最初のグループを作成してみましょう
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                setOverlayVisible(true); // Step2に入る直前に一度だけ表示
                setStep(2);
              }}
            >
              <Text style={styles.primaryButtonText}>作ってみる</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip}>
              <Text style={styles.secondaryButtonText}>あとで</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 2 && (
        <View style={{ flex: 1 }}>
          <InstructionOverlay
            text={'グループ名を入力後、お好みのカラーを選択して保存を押してください。'}
            onOk={openGroupFlow}
          />
          <GroupCreateModal
            visible={groupCreateModalVisible}
            onClose={() => setGroupCreateModalVisible(false)}
            onSaved={handleGroupSaved}
          />
        </View>
      )}

      {step === 3 && (
        <View style={{ flex: 1 }}>
          <InstructionOverlay
            text={
              '次にアイテムを作成します。アイテム名と説明文を入力してグループを選択して保存を押してください'
            }
            onOk={openItemFlow}
          />
          <ItemCreateModal
            visible={itemCreateModalVisible}
            onClose={() => setItemCreateModalVisible(false)}
            onSaved={handleItemSaved}
          />
        </View>
      )}

      {step === 4 && (
        <View style={styles.centerContent}>
          <Text style={styles.title}>DONE！</Text>
          <Text style={styles.body}>最初のアイテムが完成しました☺️</Text>
          <Text style={[styles.body, { marginTop: 8 }]}>
            グループやアイテムはいつでも編集画面から修正できます
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryButton} onPress={finishOnboarding}>
              <Text style={styles.primaryButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  title: {
    fontSize: 28,
    fontWeight: '700'
  },
  body: {
    fontSize: 16,
    textAlign: 'center'
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24
  },
  primaryButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600'
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  secondaryButtonText: {
    color: '#2196f3',
    fontWeight: '600'
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000
  },
  overlayWrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  overlayCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%'
  },
  overlayText: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'left'
  },
  overlayOk: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  overlayOkText: {
    color: '#2196f3',
    fontWeight: '600'
  }
});
