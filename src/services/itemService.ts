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
  collection
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
    await setDoc(itemRef, {
      title: item.title,
      content: item.content,
      group_id: item.group_id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
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
      return {
        id: itemId,
        title: snapshot.data().title,
        content: snapshot.data().content,
        group_id: snapshot.data().group_id
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
 * @param name グループ名
 * @param content コンテンツ
 * @param group_id グループID
 */
export const updateItemById = async (
  userId: string,
  itemId: string,
  title: string,
  content: string,
  group_id: string
): Promise<void> => {
  try {
    const itemRef = doc(db, COLLECTION.USERS, userId, COLLECTION.ITEMS, itemId);
    await updateDoc(itemRef, {
      title,
      content,
      group_id,
      updatedAt: Timestamp.now()
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

    return snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      content: doc.data().content,
      group_id: doc.data().group_id
    }));
  } catch (error) {
    console.error('Error getting items from Firestore:', error);
    return [];
  }
};

/**
 * ユーザーのアイテム数をカウント
 * @param userId ユーザーID
 */
export const countItemsByUserId = async (userId: string): Promise<number> => {
  try {
    const itemsRef = collection(db, COLLECTION.USERS, userId, COLLECTION.ITEMS);
    const snapshot = await getDocs(itemsRef);
    return snapshot.size;
  } catch (error) {
    console.error('Error counting items in Firestore:', error);
    return 0;
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
