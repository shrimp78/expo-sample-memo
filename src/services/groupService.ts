import { doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@root/firebaseConfig';
import { Group } from '@models/Group';

const USERS_COLLECTION = 'users';
const GROUPS_COLLECTION = 'groups';

/**
 * グループの新規作成
 * @param userId ユーザーID
 * @param groupId グループID
 * @param groupName グループ名
 * @param groupColor グループ色
 * @param position Position値
 */
export const saveGroup = async (
  userId: string,
  groupId: string,
  groupName: string,
  groupColor: string,
  position: number
) => {
  try {
    const groupRef = doc(db, 'users', userId, 'groups', groupId);
    await setDoc(groupRef, {
      name: groupName,
      color: groupColor,
      position: position,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log(`Group ${groupName} created in Firestore for user ${userId}`);
  } catch (error) {
    console.error('Error creating group in Firestore:', error);
    throw error;
  }
};
