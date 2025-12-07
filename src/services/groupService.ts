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
  collection,
  where,
  limit
} from 'firebase/firestore';
import { db } from '@root/firebaseConfig';
import { type Group } from '@models/Group';
import { COLLECTION } from '@constants/firebaseCollectionName';

/**
 * グループの新規作成（positionはサービス側で自動計算）
 * - 既存グループが0件: 65536
 * - 既存あり: 最大position + 65536
 * @param userId ユーザーID
 * @param groupId グループID
 * @param groupName グループ名
 * @param groupColor グループ色
 * @param newPosition 新しいposition値
 * @returns 採用したposition値を返却
 */
export const saveGroup = async (
  userId: string,
  groupId: string,
  groupName: string,
  groupColor: string,
  position: number
): Promise<number> => {
  try {
    const groupRef = doc(db, COLLECTION.USERS, userId, COLLECTION.GROUPS, groupId);
    await setDoc(groupRef, {
      name: groupName,
      color: groupColor,
      position: position,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log(`Group ${groupName} created in Firestore for user ${userId}`);
    return position;
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
    const groupsRef = doc(db, COLLECTION.USERS, userId, COLLECTION.GROUPS, groupId);
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
    const groupRef = doc(db, COLLECTION.USERS, userId, COLLECTION.GROUPS, groupId);
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
export const deleteGroupByIdWithItems = async (userId: string, groupId: string) => {
  try {
    // グループに紐づくアイテムを削除
    const itemsRef = collection(db, COLLECTION.USERS, userId, COLLECTION.ITEMS);
    const itemsQuery = query(itemsRef, where('group_id', '==', groupId));
    const itemsSnapshot = await getDocs(itemsQuery);

    const itemDeletePromises: Promise<void>[] = [];
    itemsSnapshot.docs.forEach(doc => {
      itemDeletePromises.push(deleteDoc(doc.ref));
    });
    await Promise.all(itemDeletePromises);

    // グループ本体を削除
    const groupRef = doc(db, COLLECTION.USERS, userId, COLLECTION.GROUPS, groupId);
    await deleteDoc(groupRef);
    console.log(`Group ${groupId} and related items deleted from Firestore for user ${userId}`);
  } catch (error) {
    console.error('Error deleting group in Firestore:', error);
    throw error;
  }
};

/**
 * 全てのグループを削除
 * @param userId ユーザーID
 */
export const deleteAllGroups = async (userId: string) => {
  try {
    const groupsRef = collection(db, COLLECTION.USERS, userId, COLLECTION.GROUPS);
    const snapshot = await getDocs(groupsRef);

    const deletePromises: Promise<void>[] = [];

    snapshot.docs.forEach(doc => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    // 全ての削除処理を並行実行
    await Promise.all(deletePromises);

    console.log(`All groups deleted from Firestore for user ${userId}`);
  } catch (error) {
    console.error('Error deleting all groups from Firestore:', error);
    throw error;
  }
};

/**
 * 全グループを取得
 * @param userId ユーザーID
 */
export const getAllGroupsByUserId = async (userId: string): Promise<Group[]> => {
  try {
    const groupsRef = collection(db, COLLECTION.USERS, userId, COLLECTION.GROUPS);
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

/**
 * 移動後のPosition値を計算（Trello方式）
 * @param toIndex 移動先のインデックス
 * @param groupList グループリスト
 */
export const calculateGroupNewPosition = (toIndex: number, groupList: Group[]): number => {
  if (toIndex === 0) {
    // 最初に移動する場合
    return groupList[0].position / 2;
  } else if (toIndex === groupList.length - 1) {
    // 最後に移動する場合
    return groupList[groupList.length - 1].position + 65536;
  } else {
    // 中間に移動する場合
    const prevPosition = groupList[toIndex - 1].position;
    const nextPosition = groupList[toIndex + 1].position;
    return (prevPosition + nextPosition) / 2;
  }
};

/**
 * グループの最大position値を取得
 * @param userId ユーザーID
 */
export const getMaxGroupPosition = async (userId: string): Promise<number> => {
  try {
    const groupsRef = collection(db, COLLECTION.USERS, userId, COLLECTION.GROUPS);
    const q = query(groupsRef, orderBy('position', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return 0; // グループが存在しない場合は0を返す
    }

    // 最初のドキュメント（position値が最大）を取得
    const maxDoc = snapshot.docs[0];
    return maxDoc.data().position || 0;
  } catch (error) {
    console.error('Error getting max position from Firestore:', error);
    return 0;
  }
};

/**
 * グループのPosition値だけを更新
 * @param userId ユーザーID
 * @param groupId グループID
 * @param position 新しいPosition値
 */
export const updateGroupPosition = async (userId: string, groupId: string, position: number) => {
  try {
    const groupRef = doc(db, COLLECTION.USERS, userId, COLLECTION.GROUPS, groupId);
    await updateDoc(groupRef, {
      position
    });
    console.log(`Group ${groupId} position updated to ${position} in Firestore for user ${userId}`);
  } catch (error) {
    console.error('Error updating group position in Firestore:', error);
    throw error;
  }
};
