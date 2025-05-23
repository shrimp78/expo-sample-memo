/**
 * Groupのスキーマ
 */

type GroupSchema = {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
};

export type { GroupSchema };
