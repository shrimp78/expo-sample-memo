import type { SortOptionId } from '@constants/sortOptions';
/**
 *  ユーザーの型
 */
type User = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  onboardingVersion: number;
  preferences?: { itemSortOption: SortOptionId };
  expoPushTokens?: Array<string>;
};

export type { User };
