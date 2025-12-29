import { create } from 'zustand';

type NotificationPermissionState = {
  /**
   * - null: まだ確認していない（初回起動直後など）
   * - true/false: 直近のOS権限状態
   */
  hasNotificationPermission: boolean | null;
  setHasNotificationPermission: (granted: boolean) => void;
};

export const useNotificationPermissionStore = create<NotificationPermissionState>(set => ({
  hasNotificationPermission: null,
  setHasNotificationPermission: granted => set({ hasNotificationPermission: granted })
}));


