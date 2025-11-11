import { create } from 'zustand';
import { getCachedUserPreferences, setCachedUserPreferences } from '@services/cache';
import { updateUserById } from '@services/userService';
import type { SortOptionId } from '@constants/sortOptions';

type UserPreferencesState = {
  itemSortOption: SortOptionId | null;
  isHydrated: boolean;
  isSaving: boolean;
  setItemSortOption: (option: SortOptionId) => void;
  hydrateFromCache: (userId: string) => Promise<void>;
  updateItemSortOption: (userId: string, option: SortOptionId) => Promise<void>;
};

export const useUserPreferencesStore = create<UserPreferencesState>((set, get) => ({
  itemSortOption: null,
  isHydrated: false,
  isSaving: false,
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
  },

  updateItemSortOption: async (userId: string, option: SortOptionId) => {
    const previousOption = get().itemSortOption;

    set({
      itemSortOption: option,
      isSaving: true
    });

    try {
      await Promise.all([
        setCachedUserPreferences(userId, { itemSortOption: option }),
        updateUserById(userId, { preferences: { itemSortOption: option } })
      ]);
    } catch (error) {
      console.warn('Failed to update user preferences:', error);
      set({ itemSortOption: previousOption ?? null });
      throw error;
    } finally {
      set({ isSaving: false });
    }
  }
}));
