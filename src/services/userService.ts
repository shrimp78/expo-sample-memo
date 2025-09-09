import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@root/firebaseConfig';
import { User } from '@models/User';

// Firestoreのコレクション名
const USERS_COLLECTION = 'users';

/**
 * Firestoreからユーザー情報を取得
 */
export const getUserFromFirestore = async (uid: string): Promise<User | null> => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        id: uid,
        email: userData?.email || '',
        name: userData?.name || '',
        picture: userData?.picture || undefined
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
 */
export const createUserInFirestore = async (user: User): Promise<void> => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(userDocRef, {
      email: user.email,
      name: user.name,
      picture: user.picture || null,
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
 */
export const updateUserInFirestore = async (
  uid: string,
  updates: Partial<Omit<User, 'id'>>
): Promise<void> => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userDocRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    console.log('User updated in Firestore:', uid);
  } catch (error) {
    console.error('Error updating user in Firestore:', error);
    throw error;
  }
};

/**
 * Firestoreからユーザーを削除
 */
export const deleteUserFromFirestore = async (uid: string): Promise<void> => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    await deleteDoc(userDocRef);

    console.log('User deleted from Firestore:', uid);
  } catch (error) {
    console.error('Error deleting user from Firestore:', error);
    throw error;
  }
};

/**
 * ユーザーが存在するかチェック
 */
export const checkUserExists = async (uid: string): Promise<boolean> => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userDocRef);

    return userDoc.exists();
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw error;
  }
};
