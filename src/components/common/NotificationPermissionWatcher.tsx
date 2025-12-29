import React from 'react';
import { subscribeToNotificationPermissionChange } from '@services/notificationService';
import { useNotificationPermissionStore } from '@src/store/notificationPermissionStore';

/**
 * アプリ起動中、通知権限状態を「初回 + フォアグラウンド復帰時」に同期するための常駐コンポーネント。
 * 画面には何も描画しません。
 */
export default function NotificationPermissionWatcher() {
  const setHasNotificationPermission = useNotificationPermissionStore(
    state => state.setHasNotificationPermission
  );

  React.useEffect(() => {
    const subscription = subscribeToNotificationPermissionChange(setHasNotificationPermission);
    return () => subscription.remove();
  }, [setHasNotificationPermission]);

  return null;
}


