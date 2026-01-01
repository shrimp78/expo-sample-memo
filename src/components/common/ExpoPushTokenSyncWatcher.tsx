import React from 'react';
import { useAuth } from '@context/AuthContext';
import { useNotificationPermissionStore } from '@src/store/notificationPermissionStore';

/**
 * 通知権限が「許可」になっている間、Expo Push Token を取得してユーザーに保存するための常駐コンポーネント。
 * - 画面には何も描画しません
 * - 初回起動/フォアグラウンド復帰で権限状態が更新されたタイミングをトリガーにします
 *
 * NOTE:
 * - 実運用では「毎回トークン取得・保存」を避けるために、最後に同期したトークンをSecureStore等にキャッシュするのが推奨です。
 * - Firestore更新は `arrayUnion` で追加する専用関数（例: addExpoPushToken）を `userService` に作るとより安全です。
 */

export default function ExpoPushTokenSyncWatcher() {
  const { user, isLoggedIn } = useAuth();
  const hasNotificationPermission = useNotificationPermissionStore(
    state => state.hasNotificationPermission
  );

  const syncRef = React.useRef(false);

  React.useEffect(() => {
    // まだ権限状態が不明 or 未ログイン or Userが無い時　→　何もしない
    if (hasNotificationPermission !== true) return;
    if (!isLoggedIn || !user?.id) return;

    // 多重実行ガード(権限State更新が連続した場合など)
    if (syncRef.current) return;
    syncRef.current = true;

    (async () => {
      try {
      } catch (error) {
      } finally {
        syncRef.current = false;
      }
    })();
  }, [hasNotificationPermission, isLoggedIn, user?.id, user?.expoPushTokens]);

  return null;
}
