/**
 * Itemのスキーマ
 */

type ItemSchema = {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type { ItemSchema };
