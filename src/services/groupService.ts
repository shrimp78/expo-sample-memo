import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@root/firebaseConfig';
import { Group } from '@models/Group';

const USERS_COLLECTION = 'users';
const GROUPS_COLLECTION = 'groups';

/**
 * Groupをユーザーのサブコレクションに保存
 * @param userId ユーザーID
 * @param group グループ
 */
export const saveGroup = async (
  userId: string,
  group: Omit<Group, 'id'> & { id: string }
): Promise<void> => {
  try {
    const groupRef = doc(db, USERS_COLLECTION, userId, GROUPS_COLLECTION, group.id);
    await setDoc(groupRef, {
      ...group,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`Group ${group.name} saved to Firestore for user ${userId}`);
  } catch (error) {
    console.error('Error saving group to Firestore:', error);
    throw error;
  }
};
