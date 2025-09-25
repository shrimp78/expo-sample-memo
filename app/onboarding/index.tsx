import React, { useMemo, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth, useAuthenticatedUser } from '@context/AuthContext';
import { updateUserById } from '@services/userService';
import { ONBOARDING_VERSION } from '@constants/onboarding';
import GroupCreateModal from '@screens/groups/GroupCreateModal';
import ItemCreateModal from '@screens/home/ItemCreateModal';
import { useGroups } from '@context/GroupContext';
import { useItems } from '@context/ItemContext';
import { type Group } from '@models/Group';
import * as Crypto from 'expo-crypto';
import { saveGroup } from '@services/groupService';
import { saveItem, getAllItemsByUserId } from '@services/itemService';

type Step = 1 | 2 | 3 | 4;

export default function OnboardingScreen() {
  const { user } = useAuth();
  const authedUser = useAuthenticatedUser();
  const { groups, loadGroups } = useGroups();
  const { setItems } = useItems();

  const [step, setStep] = useState<Step>(1);
  const [overlayVisible, setOverlayVisible] = useState<boolean>(true);

  // Group modal state
  const [groupCreateModalVisible, setGroupCreateModalVisible] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupColor, setGroupColor] = useState('#2196f3');

  // Item modal state
  const [itemCreateModalVisible, setItemCreateModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const canFinish = useMemo(() => step === 4, [step]);

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
  const toggleGroupCreateModal = () => setGroupCreateModalVisible(!groupCreateModalVisible);
  const handleChangeGroupColor = (color: string) => setGroupColor(color);
  const openGroupFlow = () => {
    // オーバーレイはOKで閉じたまま、作成モーダルのみ開く
    setGroupCreateModalVisible(true);
  };
  const handleSaveGroupPress = async () => {
    if (!groupName) {
      Alert.alert('確認', 'グループ名を入力してください');
      return;
    }
    if (!groupColor) {
      Alert.alert('確認', 'グループの色を選択してください');
      return;
    }
    try {
      const groupId = Crypto.randomUUID();
      await saveGroup(authedUser.id, groupId, groupName, groupColor);
      toggleGroupCreateModal();
      await loadGroups();
      setGroupName('');
      setGroupColor('#2196f3');
      setStep(3);
      setOverlayVisible(true); // Step3の説明を表示
    } catch (e) {
      Alert.alert('エラー', '保存に失敗しました');
    }
  };

  // Step 3 helpers (Item)
  const toggleItemCreateModal = () => setItemCreateModalVisible(!itemCreateModalVisible);
  const toggleGroupModal = () => setGroupModalVisible(!groupModalVisible);
  const openItemFlow = () => {
    // groupsが1件だけなら選択を自動化
    if (groups.length === 1) setSelectedGroup(groups[0]);
    // オーバーレイはOKで閉じたまま、作成モーダルのみ開く
    setItemCreateModalVisible(true);
  };
  const handleSaveItemPress = async () => {
    if (!title) {
      Alert.alert('確認', 'タイトルを入力してください');
      return;
    }
    if (!content) {
      Alert.alert('確認', 'コンテンツを入力してください');
      return;
    }
    if (!selectedGroup) {
      Alert.alert('確認', 'グループを選択してください');
      return;
    }
    try {
      const id = Crypto.randomUUID();
      await saveItem(authedUser.id, { id, title, content, group_id: selectedGroup.id });
      toggleItemCreateModal();
      const items = await getAllItemsByUserId(authedUser.id);
      setItems(items);
      setTitle('');
      setContent('');
      setSelectedGroup(null);
      setStep(4);
    } catch (e) {
      Alert.alert('エラー', '保存に失敗しました');
    }
  };

  // Overlays for instruction text
  const InstructionOverlay = ({ text, onOk }: { text: string; onOk: () => void }) => (
    <Modal transparent visible={overlayVisible} animationType="fade">
      <View style={styles.overlayWrap}>
        <View style={styles.overlayCard}>
          <Text style={styles.overlayText}>{text}</Text>
          <TouchableOpacity
            style={styles.overlayOk}
            onPress={() => {
              setOverlayVisible(false);
              onOk();
            }}
          >
            <Text style={styles.overlayOkText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {step === 1 && (
        <View style={styles.centerContent}>
          <Text style={styles.title}>ようこそ！</Text>
          <Text style={styles.body}>このアプリでは、グループとItemを取り扱います。</Text>
          <Text style={[styles.body, { marginTop: 16 }]}>
            まず最初のグループを作成してみましょう。
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
            text={
              'グループ名を入力後、お好みのカラーを選択してください。OKを押すと実際の作成画面になります。'
            }
            onOk={openGroupFlow}
          />
          <GroupCreateModal
            visible={groupCreateModalVisible}
            toggleCreateModal={toggleGroupCreateModal}
            onSave={handleSaveGroupPress}
            groupName={groupName}
            groupColor={groupColor}
            onChangeGroupName={setGroupName}
            onChangeGroupColor={handleChangeGroupColor}
          />
        </View>
      )}

      {step === 3 && (
        <View style={{ flex: 1 }}>
          <InstructionOverlay
            text={'アイテムを作成します。好きなアイテム名と説明文を入力して保存を押してください。'}
            onOk={openItemFlow}
          />
          <ItemCreateModal
            visible={itemCreateModalVisible}
            toggleCreateModal={toggleItemCreateModal}
            onSave={handleSaveItemPress}
            onChangeTitle={setTitle}
            onChangeContent={setContent}
            onSelectGroup={toggleGroupModal}
            title={title}
            content={content}
            groupModalVisible={groupModalVisible}
            toggleGroupModal={toggleGroupModal}
            groups={groups}
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
          />
        </View>
      )}

      {step === 4 && (
        <View style={styles.centerContent}>
          <Text style={styles.title}>完了！</Text>
          <Text style={styles.body}>お疲れ様でした！ 最初のItem作成が完了しました☺️。</Text>
          <Text style={[styles.body, { marginTop: 8 }]}>
            グループ名やItem名などはいつでも編集画面から変更できます。
          </Text>
          <Text style={[styles.body, { marginTop: 8 }]}>それでは素敵なSPDをお楽しみください。</Text>
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
