/**
 *  アイテムの型
 */
type Item = {
  id: number;
  title: string;
  content: string;
  labelId?: number | undefined;
};

export type { Item };
