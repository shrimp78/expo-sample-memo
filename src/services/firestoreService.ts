import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import type { Group } from '@models/Group';
import type { Item } from '@models/Item';

/**
 * Firestore上のユーザー別データ管理サービス
 */

/**
 * Itemをユーザーのサブコレクションに保存
 */
export const saveItemToFirestore = async (
  userId: string,
  item: Omit<Item, 'id'> & { id: string }
): Promise<void> => {
  try {
    const itemRef = doc(db, 'users', userId, 'items', item.id);
    await setDoc(itemRef, {
      ...item,
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
 * Itemを削除
 * @param userId ユーザーID
 * @param itemId アイテムID
 */
export const deleteItemFromFirestore = async (userId: string, itemId: string): Promise<void> => {
  try {
    const itemRef = doc(db, 'users', userId, 'items', itemId);
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
export const deleteAllItemFromFirestore = async (userId: string): Promise<void> => {
  try {
    const itemsRef = collection(db, 'users', userId, 'items');
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
 * ユーザーのアイテム数をカウント
 */
export const countUserItemsInFirestore = async (userId: string): Promise<number> => {
  try {
    const itemsRef = collection(db, 'users', userId, 'items');
    const snapshot = await getDocs(itemsRef);
    return snapshot.size;
  } catch (error) {
    console.error('Error counting items in Firestore:', error);
    return 0;
  }
};

/**
 * アイテムをIDベースで取得
 * @param userId ユーザーID
 * @param itemId グループID
 */
export const getItemByIdFromFirestore = async (
  userId: string,
  itemId: string
): Promise<Item | null> => {
  try {
    const itemRef = doc(db, 'users', userId, 'items', itemId);
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
export const updateItemByIdFromFirestore = async (
  userId: string,
  itemId: string,
  title: string,
  content: string,
  group_id: string
): Promise<void> => {
  try {
    const itemRef = doc(db, 'users', userId, 'items', itemId);
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
 * ユーザーの全アイテムを取得
 */
export const getAllUserItemsFromFirestore = async (userId: string): Promise<Item[]> => {
  try {
    const itemsRef = collection(db, 'users', userId, 'items');
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
