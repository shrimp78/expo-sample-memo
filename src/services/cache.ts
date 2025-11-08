import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Item } from '@models/Item';
import { type Group } from '@models/Group';
import { Timestamp } from 'firebase/firestore';
import { type SortOptionId } from '@constants/sortOptions';

const itemsKey = (userId: string) => `cache:items:${userId}`;
const groupsKey = (userId: string) => `cache:groups:${userId}`;
const userPreferencesKey = (userId: string) => `cache:userPreferences:${userId}`;

export async function getCachedItems(userId: string): Promise<Item[] | null> {
  try {
    const raw = await AsyncStorage.getItem(itemsKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return null;

    // Anniv フォーマット互換: JSONオブジェクトからTimestampに変換
    const revived: Item[] = parsed.map((entry: any) => {
      const { anniv, ...rest } = entry ?? {};

      if (
        anniv &&
        typeof anniv === 'object' &&
        typeof anniv.seconds === 'number' &&
        typeof anniv.nanoseconds === 'number'
      ) {
        return { ...rest, anniv: new Timestamp(anniv.seconds, anniv.nanoseconds) };
      }
    });

    return revived;
  } catch (error) {
    console.warn('Failed to read items cache:', error);
    return null;
  }
}

export async function setCachedItems(userId: string, items: Item[]): Promise<void> {
  try {
    // 注：anniv のTimestamp は JSON 直列化時にメソッドが失われるため、{ seconds: 1728000000, nanoseconds: 0 }のJSONになる
    await AsyncStorage.setItem(itemsKey(userId), JSON.stringify(items));
  } catch (error) {
    console.warn('Failed to write items cache:', error);
  }
}

export async function getCachedGroups(userId: string): Promise<Group[] | null> {
  try {
    const raw = await AsyncStorage.getItem(groupsKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Group[];
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.warn('Failed to read groups cache:', error);
    return null;
  }
}

export async function setCachedGroups(userId: string, groups: Group[]): Promise<void> {
  try {
    await AsyncStorage.setItem(groupsKey(userId), JSON.stringify(groups));
  } catch (error) {
    console.warn('Failed to write groups cache:', error);
  }
}

export async function clearUserCache(userId: string): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      itemsKey(userId),
      groupsKey(userId),
      userPreferencesKey(userId)
    ]);
  } catch (error) {
    console.warn('Failed to clear user cache:', error);
  }
}

export async function setCachedUserPreferences(
  userId: string,
  preferences: { itemSortOption: SortOptionId }
): Promise<void> {
  try {
    await AsyncStorage.setItem(userPreferencesKey(userId), JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to write user preferences cache:', error);
  }
}

export async function getCachedUserPreferences(
  userId: string
): Promise<{ itemSortOption: SortOptionId } | null> {
  try {
    const raw = await AsyncStorage.getItem(userPreferencesKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      'itemSortOption' in parsed &&
      typeof (parsed as { itemSortOption: unknown }).itemSortOption === 'string'
    ) {
      return { itemSortOption: (parsed as { itemSortOption: SortOptionId }).itemSortOption };
    }
    return null;
  } catch (error) {
    console.warn('Failed to read user preferences cache:', error);
    return null;
  }
}
