import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  where,
  getDocs,
  collection,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@root/firebaseConfig';
import { type Item } from '@models/Item';
import { COLLECTION } from '@constants/firebaseCollectionName';

/**
 * Itemをユーザーのサブコレクションに保存
 */
export const saveItem = async (userId: string, item: Item): Promise<void> => {
  try {
    const itemRef = doc(db, COLLECTION.USERS, userId, COLLECTION.ITEMS, item.id);

    // 通知が有効な場合、次回通知予定日を計算
    const nextNotifyAt =
      item.notifyEnabled && item.notifyTiming
        ? calculateNextNotifyAt(item.birthday, item.notifyTiming)
        : null;
    await setDoc(itemRef, {
      title: item.title,
      content: item.content,
      group_id: item.group_id,
      birthday: item.birthday,
      notifyEnabled: item.notifyEnabled,
      notifyTiming: item.notifyTiming,
      nextNotifyAt: nextNotifyAt,
      lastNotifiedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`Item ${item.title} saved to Firestore for user ${userId}`);
  } catch (error) {
    console.error('Error saving item to Firestore:', error);
    throw error;
  }
};

/**
 * アイテムをIDベースで取得
 * @param userId ユーザーID
 * @param itemId グループID
 */
export const getItemById = async (userId: string, itemId: string): Promise<Item | null> => {
  try {
    const itemRef = doc(db, COLLECTION.USERS, userId, COLLECTION.ITEMS, itemId);
    const snapshot = await getDoc(itemRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      const birthday = data?.birthday;
      if (!birthday) {
        throw new Error('Invalid item data: birthday field is missing');
      }
      return {
        id: itemId,
        title: data.title,
        content: data.content,
        group_id: data.group_id,
        birthday,
        notifyEnabled: data.notifyEnabled ?? false,
        notifyTiming: data.notifyTiming ?? null,
        nextNotifyAt: data.nextNotifyAt ?? null,
        lastNotifiedAt: data.lastNotifiedAt ?? null
      };
    } else {
      console.log('アイテムが見つかりません');
    }
    return null;
  } catch (error) {
    console.error('Error getting item by id from Firestore:', error);
    return null;
  }
};

/**
 * アイテムをIDベースで更新
 * @param userId ユーザーID
 * @param itemId グループID
 * @param title アイテム名
 * @param content コンテンツ
 * @param group_id グループID
 * @param birthday 生年月日
 * @param notifyEnabled 通知有効フラグ
 * @param notifyTiming 通知タイミング
 */
export const updateItemById = async (
  userId: string,
  itemId: string,
  title: string,
  content: string,
  group_id: string,
  birthday: Timestamp,
  notifyEnabled: boolean,
  notifyTiming: string | null
): Promise<void> => {
  try {
    const itemRef = doc(db, COLLECTION.USERS, userId, COLLECTION.ITEMS, itemId);
    // 通知が有効な場合、次回通知予定日を計算（通知設定日時が変わる場合もあるので）
    const nextNotifyAt =
      notifyEnabled && notifyTiming ? calculateNextNotifyAt(birthday, notifyTiming) : null;
    await updateDoc(itemRef, {
      title,
      content,
      group_id,
      birthday,
      notifyEnabled,
      notifyTiming,
      nextNotifyAt,
      updatedAt: serverTimestamp()
    });
    console.log(`Item ${title} updated in Firestore for user ${userId}`);
  } catch (error) {
    console.error('Error updating item in Firestore:', error);
    throw error;
  }
};

/**
 * Itemを削除
 * @param userId ユーザーID
 * @param itemId アイテムID
 */
export const deleteItemById = async (userId: string, itemId: string): Promise<void> => {
  try {
    const itemRef = doc(db, COLLECTION.USERS, userId, COLLECTION.ITEMS, itemId);
    await deleteDoc(itemRef);
    console.log(`Item ${itemId} deleted from Firestore for user ${userId}`);
  } catch (error) {
    console.error('Error deleting item from Firestore:', error);
    throw error;
  }
};

/**
 * Itemを削除
 * @param userId ユーザーID
 */
export const deleteAllItems = async (userId: string): Promise<void> => {
  try {
    const itemsRef = collection(db, COLLECTION.USERS, userId, COLLECTION.ITEMS);
    const snapshot = await getDocs(itemsRef);
    const deletePromises: Promise<void>[] = [];

    snapshot.docs.forEach(doc => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting item from Firestore:', error);
    throw error;
  }
};

/**
 * ユーザーの全アイテムを取得
 * @param userId ユーザーID
 */
export const getAllItemsByUserId = async (userId: string): Promise<Item[]> => {
  try {
    const itemsRef = collection(db, COLLECTION.USERS, userId, COLLECTION.ITEMS);
    const snapshot = await getDocs(itemsRef);

    return snapshot.docs
      .map(doc => {
        const data = doc.data();
        const birthday = data?.birthday;
        if (!birthday) {
          console.warn(`Item ${doc.id} is missing birthday field`);
          return null;
        }
        return {
          id: doc.id,
          title: data.title,
          content: data.content,
          group_id: data.group_id,
          birthday,
          notifyEnabled: data.notifyEnabled ?? false,
          notifyTiming: data.notifyTiming ?? null,
          nextNotifyAt: data.nextNotifyAt ?? null,
          lastNotifiedAt: data.lastNotifiedAt ?? null
        } as Item;
      })
      .filter((item): item is Item => item !== null);
  } catch (error) {
    console.error('Error getting items from Firestore:', error);
    return [];
  }
};

/**
 * ユーザーの持っているグループ数をカウント
 * @param userId ユーザーID
 * @param groupId グループID
 */
export const countItemsByGroupId = async (userId: string, groupId: string): Promise<number> => {
  try {
    const groupsRef = collection(db, COLLECTION.USERS, userId, COLLECTION.ITEMS);
    const itemsQuery = query(groupsRef, where('group_id', '==', groupId));
    const itemsSnapshot = await getDocs(itemsQuery);
    return itemsSnapshot.size;
  } catch (error) {
    console.error('Error counting items:', error);
    return 0;
  }
};

/**
 * 通知タイミングから
 * 次回通知予定日時を計算（毎年繰り返し）
 * @param birthday 生年月日
 * @param notifyTiming 通知タイミング
 * @returns 次回通知予定日時のTimestamp
 */
const calculateNextNotifyAt = (birthday: Timestamp, notifyTiming: string): Timestamp | null => {
  const birthdayDate = birthday.toDate();
  const now = new Date();

  // 今年の誕生日（午前9時）を取得
  let nextBirthday = new Date(
    now.getFullYear(),
    birthdayDate.getMonth(),
    birthdayDate.getDate(),
    9,
    0,
    0,
    0
  );

  // 通知タイミングを引いた日時
  const notifyDate = new Date(nextBirthday);
  switch (notifyTiming) {
    case '1h':
      notifyDate.setHours(notifyDate.getHours() - 1);
      break;
    case '24h':
      notifyDate.setDate(notifyDate.getDate() - 1);
      break;
    case '7d':
      notifyDate.setDate(notifyDate.getDate() - 7);
      break;
    case '14d':
      notifyDate.setDate(notifyDate.getDate() - 14);
      break;
    case '30d':
      notifyDate.setDate(notifyDate.getDate() - 30);
      break;
    default:
      return null;
  }

  // 通知日時が既に過ぎていたら来年の日時を計算
  if (notifyDate < now) {
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    notifyDate.setFullYear(notifyDate.getFullYear() + 1);
  }
  return Timestamp.fromDate(notifyDate);
};
