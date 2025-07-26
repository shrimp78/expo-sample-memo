/**
 *  アイテムの型
 */
type Item = {
  id: string;
  title: string;
  content: string;
  group_id: string | null;
};

export type { Item };
