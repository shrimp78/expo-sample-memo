import { create } from 'zustand';
import { getCachedUserPreferences } from '@services/cache';
import type { SortOptionId } from '@constants/sortOptions';

type UserPreferencesState = {
  itemSortOption: SortOptionId | null;
  isHydrated: boolean;
  setItemSortOption: (option: SortOptionId) => void;
  hydrateFromCache: (userId: string) => Promise<void>;
};

export const useUserPreferencesStore = create<UserPreferencesState>(set => ({
  itemSortOption: null,
  isHydrated: false,
  setItemSortOption: option => set({ itemSortOption: option }),

  hydrateFromCache: async (userId: string) => {
    try {
      const cached = await getCachedUserPreferences(userId);
      set({
        itemSortOption: cached?.itemSortOption ?? null,
        isHydrated: true
      });
    } catch (error) {
      console.warn('Failed to hydrate user preferences from cache:', error);
      set({ isHydrated: true });
    }
  }
}));
