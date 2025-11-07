export type SortOptionId = 'title-asc' | 'title-desc' | 'anniv-asc' | 'anniv-desc';

export type SortOption = {
  id: SortOptionId;
  label: string;
  description: string;
};

export const sortOptions: SortOption[] = [
  {
    id: 'title-asc',
    label: 'タイトル A → Z',
    description: 'タイトルをアルファベット順（昇順）で表示します。'
  },
  {
    id: 'title-desc',
    label: 'タイトル Z → A',
    description: 'タイトルをアルファベット順（降順）で表示します。'
  },
  {
    id: 'anniv-asc',
    label: '日付 昇順',
    description: '日付が早いものから順番に表示します。'
  },
  {
    id: 'anniv-desc',
    label: '日付 降順',
    description: '日付が遅いものから順番に表示します。'
  }
];

export const DEFAULT_SORT_OPTION: SortOptionId = 'title-asc';
