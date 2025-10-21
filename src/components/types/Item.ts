import type { Timestamp } from 'firebase/firestore';
/**
 *  アイテムの型
 */
type Item = {
  id: string;
  title: string;
  content: string | null;
  group_id: string | null; // TBC : これは必須項目にしてもいいかも
  anniv: Timestamp;
};

export type { Item };
