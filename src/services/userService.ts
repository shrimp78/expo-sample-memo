import firestore from '@react-native-firebase/firestore';
import { User } from '../components/types/User';

// Firestoreのコレクション名
const USERS_COLLECTION = 'users';

/**
 * Firestoreからユーザー情報を取得
 */
export const getUserFromFirestore = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await firestore().collection(USERS_COLLECTION).doc(uid).get();

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
    await firestore()
      .collection(USERS_COLLECTION)
      .doc(user.id)
      .set({
        email: user.email,
        name: user.name,
        picture: user.picture || null,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp()
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
    await firestore()
      .collection(USERS_COLLECTION)
      .doc(uid)
      .update({
        ...updates,
        updatedAt: firestore.FieldValue.serverTimestamp()
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
    await firestore().collection(USERS_COLLECTION).doc(uid).delete();

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
    const userDoc = await firestore().collection(USERS_COLLECTION).doc(uid).get();

    return userDoc.exists();
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw error;
  }
};
