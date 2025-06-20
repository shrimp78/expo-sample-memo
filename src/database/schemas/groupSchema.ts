/**
 * Groupのスキーマ
 */

type GroupSchema = {
  id: string;
  name: string;
  color: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

export type { GroupSchema };
