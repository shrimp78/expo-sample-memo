import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  getDocs
} from 'firebase/firestore';
import { db } from '@root/firebaseConfig';
import { User } from '@models/User';
import { COLLECTION } from '@constants/firebaseCollectionName';
import { DEFAULT_SORT_OPTION, normalizeSortOptionId } from '@constants/sortOptions';

/**
 * Firestoreからユーザー情報を取得
 * @param uid ユーザーID
 */
export const getUserByUid = async (uid: string): Promise<User | null> => {
  try {
    const userDocRef = doc(db, COLLECTION.USERS, uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();

      // Firestoreにデータが無い/空の時でもアプリは常にitemSortOptionを保持
      const itemSortOption =
        normalizeSortOptionId(userData?.preferences?.itemSortOption) ?? DEFAULT_SORT_OPTION;

      return {
        id: uid,
        email: userData?.email || '',
        name: userData?.name || '',
        picture: userData?.picture || undefined,
        onboardingVersion: userData?.onboardingVersion || 0,
        preferences: { itemSortOption }
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user from Firestore:', error);
    throw error;
  }
};

/**
 * Firestoreに新しいユーザーを作成
 * @param User ユーザー
 */
export const saveUser = async (user: User): Promise<void> => {
  try {
    const userDocRef = doc(db, COLLECTION.USERS, user.id);
    await setDoc(userDocRef, {
      email: user.email,
      name: user.name,
      picture: user.picture || null,
      onboardingVersion: user.onboardingVersion || 0,
      preferences: {
        itemSortOption: user.preferences?.itemSortOption ?? DEFAULT_SORT_OPTION
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('User created in Firestore:', user.email);
  } catch (error) {
    console.error('Error creating user in Firestore:', error);
    throw error;
  }
};

/**
 * Firestoreのユーザー情報を更新
 * @param uid ユーザーID
 * @param updates 更新するユーザー情報(User)
 */
export const updateUserById = async (
  uid: string,
  updates: Partial<Omit<User, 'id'>>
): Promise<void> => {
  try {
    const userDocRef = doc(db, COLLECTION.USERS, uid);

    const payload: Record<string, unknown> = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    if (updates.preferences?.itemSortOption) {
      payload.preferences = {
        itemSortOption: updates.preferences.itemSortOption
      };
    }
    await updateDoc(userDocRef, payload);

    console.log('User updated in Firestore:', uid);
  } catch (error) {
    console.error('Error updating user in Firestore:', error);
    throw error;
  }
};

/**
 * Firestoreからユーザーを削除
 * @param uid ユーザーID
 */
export const deleteUserById = async (uid: string): Promise<void> => {
  try {
    // サブコレクション（groups, items）を先に全削除
    const groupsRef = collection(db, COLLECTION.USERS, uid, COLLECTION.GROUPS);
    const itemsRef = collection(db, COLLECTION.USERS, uid, COLLECTION.ITEMS);

    const [groupsSnapshot, itemsSnapshot] = await Promise.all([
      getDocs(groupsRef),
      getDocs(itemsRef)
    ]);

    const deletePromises: Promise<void>[] = [];

    groupsSnapshot.docs.forEach(doc => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    itemsSnapshot.docs.forEach(doc => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);

    // 最後にユーザードキュメント本体を削除
    const userDocRef = doc(db, COLLECTION.USERS, uid);
    await deleteDoc(userDocRef);

    console.log('User and all sub collections deleted from Firestore:', uid);
  } catch (error) {
    console.error('Error deleting user and sub collections from Firestore:', error);
    throw error;
  }
};

/**
 * ユーザーが存在するかチェック
 * @param uid ユーザーID
 */
export const checkUserExists = async (uid: string): Promise<boolean> => {
  try {
    const userDocRef = doc(db, COLLECTION.USERS, uid);
    const userDoc = await getDoc(userDocRef);

    return userDoc.exists();
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw error;
  }
};
