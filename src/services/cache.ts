import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Item } from '@models/Item';
import { type Group } from '@models/Group';
import { Timestamp } from 'firebase/firestore';

const itemsKey = (userId: string) => `cache:items:${userId}`;
const groupsKey = (userId: string) => `cache:groups:${userId}`;

export async function getCachedItems(userId: string): Promise<Item[] | null> {
  try {
    const raw = await AsyncStorage.getItem(itemsKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return null;

    // 旧フォーマット互換: annivMillis(number) / anniv({seconds,nanoseconds}) / anniv(Date-string/number)
    const revived: Item[] = parsed.map((entry: any) => {
      const { annivMillis, anniv, ...rest } = entry ?? {};

      // 1) 新キャッシュ形式: annivMillis (number)
      if (typeof annivMillis === 'number') {
        return { ...rest, anniv: Timestamp.fromMillis(annivMillis) } as Item;
      }

      // 2) 旧形式: anniv オブジェクトに seconds/nanoseconds
      if (
        anniv &&
        typeof anniv === 'object' &&
        typeof anniv.seconds === 'number' &&
        typeof anniv.nanoseconds === 'number'
      ) {
        // nanoseconds は 10^-9 秒単位。ミリ秒へ丸める
        const millis = anniv.seconds * 1000 + Math.floor(anniv.nanoseconds / 1e6);
        return { ...rest, anniv: Timestamp.fromMillis(millis) } as Item;
      }

      // 3) 文字列/数値（Date互換）
      if (typeof anniv === 'string' || typeof anniv === 'number') {
        const d = new Date(anniv);
        if (!Number.isNaN(d.getTime())) {
          return { ...rest, anniv: Timestamp.fromDate(d) } as Item;
        }
      }

      // 4) 不正形の場合は現在時刻でフォールバック（クラッシュ回避）
      return { ...rest, anniv: Timestamp.fromMillis(Date.now()) } as Item;
    });

    return revived;
  } catch (error) {
    console.warn('Failed to read items cache:', error);
    return null;
  }
}

export async function setCachedItems(userId: string, items: Item[]): Promise<void> {
  try {
    // Timestamp は JSON 直列化時にメソッドが失われるため、ミリ秒へ変換して保存
    const serialized = items.map(({ anniv, ...rest }) => ({
      ...rest,
      annivMillis: anniv.toMillis()
    }));
    await AsyncStorage.setItem(itemsKey(userId), JSON.stringify(serialized));
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
