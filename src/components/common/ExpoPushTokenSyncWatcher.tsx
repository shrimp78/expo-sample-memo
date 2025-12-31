import React from 'react';
import { useAuth } from '@context/AuthContext';

/**
 * 通知権限が「許可」になっている間、Expo Push Token を取得してユーザーに保存するための常駐コンポーネント。
 * - 画面には何も描画しません
 * - 初回起動/フォアグラウンド復帰で権限状態が更新されたタイミングをトリガーにします
 *
 * NOTE:
 * - 実運用では「毎回トークン取得・保存」を避けるために、最後に同期したトークンをSecureStore等にキャッシュするのが推奨です。
 * - Firestore更新は `arrayUnion` で追加する専用関数（例: addExpoPushToken）を `userService` に作るとより安全です。
 */
