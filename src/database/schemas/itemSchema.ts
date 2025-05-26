/**
 * Itemのスキーマ
 */

type ItemSchema = {
  id: string;
  title: string;
  content: string;
  group_id: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type { ItemSchema };
