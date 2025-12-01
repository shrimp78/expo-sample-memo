import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Item } from '@models/Item';
import { type Group } from '@models/Group';
import { Timestamp } from 'firebase/firestore';
import { type SortOptionId, normalizeSortOptionId } from '@constants/sortOptions';

const itemsKey = (userId: string) => `cache:items:${userId}`;
const groupsKey = (userId: string) => `cache:groups:${userId}`;
const userPreferencesKey = (userId: string) => `cache:userPreferences:${userId}`;

export async function getCachedItems(userId: string): Promise<Item[] | null> {
  try {
    const raw = await AsyncStorage.getItem(itemsKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return null;

    // Birthday フォーマット互換: JSONオブジェクトからTimestampに変換
    const revived: Item[] = parsed.reduce<Item[]>((acc, entry: any) => {
      if (!entry) return acc;
      const { birthday, anniv, ...rest } = entry;
      const serializedTimestamp = birthday ?? anniv;

      if (
        serializedTimestamp &&
        typeof serializedTimestamp === 'object' &&
        typeof serializedTimestamp.seconds === 'number' &&
        typeof serializedTimestamp.nanoseconds === 'number'
      ) {
        acc.push({
          ...rest,
          birthday: new Timestamp(serializedTimestamp.seconds, serializedTimestamp.nanoseconds)
        } as Item);
      }
      return acc;
    }, []);

    return revived;
  } catch (error) {
    console.warn('Failed to read items cache:', error);
    return null;
  }
}

export async function setCachedItems(userId: string, items: Item[]): Promise<void> {
  try {
    // 注：birthday のTimestamp は JSON 直列化時にメソッドが失われるため、{ seconds: 1728000000, nanoseconds: 0 }のJSONになる
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
      const normalized = normalizeSortOptionId(
        (parsed as { itemSortOption: unknown }).itemSortOption
      );
      if (normalized) {
        return { itemSortOption: normalized };
      }
    }
    return null;
  } catch (error) {
    console.warn('Failed to read user preferences cache:', error);
    return null;
  }
}
