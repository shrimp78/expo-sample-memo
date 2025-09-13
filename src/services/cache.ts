import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Item } from '@models/Item';
import { type Group } from '@models/Group';

const itemsKey = (userId: string) => `cache:items:${userId}`;
const groupsKey = (userId: string) => `cache:groups:${userId}`;

export async function getCachedItems(userId: string): Promise<Item[] | null> {
  try {
    const raw = await AsyncStorage.getItem(itemsKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Item[];
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.warn('Failed to read items cache:', error);
    return null;
  }
}

export async function setCachedItems(userId: string, items: Item[]): Promise<void> {
  try {
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
    await AsyncStorage.multiRemove([itemsKey(userId), groupsKey(userId)]);
  } catch (error) {
    console.warn('Failed to clear user cache:', error);
  }
}
