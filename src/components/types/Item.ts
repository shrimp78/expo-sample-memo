import type { Timestamp } from 'firebase/firestore';
/**
 *  アイテムの型
 */
type Item = {
  id: string;
  title: string;
  content: string | null;
  group_id: string | null;
  birthday: Timestamp;
  notifyEnabled: boolean | null;
  notifyTiming: string | null; // '1h', '24h', '7d', '14d', '30d
  nextNotifyAt: Timestamp | null; // 次回通知予定日時
  lastNotifiedAt: Timestamp | null; // 最後に通知を送った日時
};

export type { Item };
