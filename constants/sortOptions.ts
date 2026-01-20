export const SORT_OPTION_IDS = [
  'title-asc',
  'title-desc',
  'birthday-asc',
  'birthday-desc'
] as const;
export type SortOptionId = (typeof SORT_OPTION_IDS)[number];
const sortOptionIdSet = new Set<string>(SORT_OPTION_IDS);

export type SortOption = {
  id: SortOptionId;
  label: string;
  description: string;
};

export const sortOptions: SortOption[] = [
  {
    id: 'title-asc',
    label: '名前 A → Z',
    description: '名前をアルファベット順（昇順）で表示します。'
  },
  {
    id: 'title-desc',
    label: '名前 Z → A',
    description: '名前をアルファベット順（降順）で表示します。'
  },
  {
    id: 'birthday-asc',
    label: '日付 昇順',
    description: '日付が早いものから順番に表示します。'
  },
  {
    id: 'birthday-desc',
    label: '日付 降順',
    description: '日付が遅いものから順番に表示します。'
  }
];

export const DEFAULT_SORT_OPTION: SortOptionId = 'title-asc';

// 永続化済みの値をアプリ内部で扱えるIDへ正規化するために使用
export const normalizeSortOptionId = (value: unknown): SortOptionId | null => {
  if (typeof value !== 'string') {
    return null;
  }
  // 有効なIDのセットに含まれているかをチェックし、含まれていればSortOptionId型にキャストして返す
  if (sortOptionIdSet.has(value)) {
    return value as SortOptionId;
  }
  return null;
};
