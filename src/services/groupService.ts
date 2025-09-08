import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  orderBy,
  getDocs,
  collection
} from 'firebase/firestore';
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

/**
 * グループをIDベースで更新
 * @param userId ユーザーID
 * @param groupId グループID
 * @param name グループ名
 * @param color グループ色
 */
export const updateGroupById = async (
  userId: string,
  groupId: string,
  name: string,
  color: string
): Promise<void> => {
  try {
    const groupRef = doc(db, USERS_COLLECTION, userId, GROUPS_COLLECTION, groupId);
    await updateDoc(groupRef, {
      name,
      color,
      updatedAt: Timestamp.now()
    });
    console.log(`Group ${name} updated in Firestore for user ${userId}`);
  } catch (error) {
    console.error('Error updating group in Firestore:', error);
    throw error;
  }
};

/**
 * グループを削除
 * @param userId ユーザーID
 * @param groupId グループID
 */
export const deleteGroupById = async (userId: string, groupId: string) => {
  try {
    // TODO : あとで、グループに紐づくアイテムの削除もここで実行する
    const groupRef = doc(db, USERS_COLLECTION, userId, GROUPS_COLLECTION, groupId);
    await deleteDoc(groupRef);
    console.log(`Group ${groupId} deleted from Firestore for user ${userId}`);
  } catch (error) {
    console.error('Error deleting group in Firestore:', error);
    throw error;
  }
};

/**
 * 全グループを取得
 * @param userId ユーザーID
 */
export const getAllGroupsByUserId = async (userId: string): Promise<Group[]> => {
  try {
    const groupsRef = collection(db, USERS_COLLECTION, userId, GROUPS_COLLECTION);
    const q = query(groupsRef, orderBy('position', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      color: doc.data().color,
      position: doc.data().position
    }));
  } catch (error) {
    console.error('Error getting groups from Firestore:', error);
    return [];
  }
};
