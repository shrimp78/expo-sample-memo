import { doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@root/firebaseConfig';
import { type Group } from '@models/Group';

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
    const groupRef = doc(db, USERS_COLLECTION, userId, GROUPS_COLLECTION, groupId);
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

/**
 * グループをIDベースで取得
 * @param userId ユーザーID
 * @param groupId グループID
 */
export const getGroupById = async (userId: string, groupId: string): Promise<Group | null> => {
  try {
    const groupsRef = doc(db, USERS_COLLECTION, userId, GROUPS_COLLECTION, groupId);
    const snapshot = await getDoc(groupsRef);
    if (snapshot.exists()) {
      return {
        id: groupId,
        name: snapshot.data().name,
        color: snapshot.data().color,
        position: snapshot.data().position
      };
    } else {
      console.log('グループが見つかりません');
    }
    return null;
  } catch (error) {
    console.error('Error getting group by id from Firestore:', error);
    return null;
  }
};
