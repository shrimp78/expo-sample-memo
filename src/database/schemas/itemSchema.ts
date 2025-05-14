/**
 * Itemのスキーマ
 */

type ItemSchema = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type { ItemSchema };
