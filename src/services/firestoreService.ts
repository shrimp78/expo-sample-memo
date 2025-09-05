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
 * Groupをユーザーのサブコレクションに保存
 */
export const saveGroupToFirestore = async (
  userId: string,
  group: Omit<Group, 'id'> & { id: string }
): Promise<void> => {
  try {
    const groupRef = doc(db, 'users', userId, 'groups', group.id);
    await setDoc(groupRef, {
      ...group,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log(`Group ${group.name} saved to Firestore for user ${userId}`);
  } catch (error) {
    console.error('Error saving group to Firestore:', error);
    throw error;
  }
};

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
 * ユーザーのグループ数をカウント
 */
export const countUserGroupsInFirestore = async (userId: string): Promise<number> => {
  try {
    const groupsRef = collection(db, 'users', userId, 'groups');
    const snapshot = await getDocs(groupsRef);
    return snapshot.size;
  } catch (error) {
    console.error('Error counting groups in Firestore:', error);
    return 0;
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
 * ユーザーの全グループを取得
 */
export const getAllUserGroupsFromFirestore = async (userId: string): Promise<Group[]> => {
  try {
    const groupsRef = collection(db, 'users', userId, 'groups');
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
 * グループをIDベースで取得
 * @param userId ユーザーID
 * @param groupId グループID
 */
export const getGroupByIdFromFirestore = async (
  userId: string,
  groupId: string
): Promise<Group | null> => {
  try {
    const groupsRef = doc(db, 'users', userId, 'groups', groupId);
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
export const updateGroupByIdFromFirestore = async (
  userId: string,
  groupId: string,
  name: string,
  color: string
): Promise<void> => {
  try {
    const groupRef = doc(db, 'users', userId, 'groups', groupId);
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

/**
 * 移動後のPosition値を計算（Trello方式）
 * @param toIndex 移動先のインデックス
 * @param groupList グループリスト
 */
export const calculateNewPosition = (toIndex: number, groupList: Group[]): number => {
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
export const getMaxPosition = async (userId: string): Promise<number> => {
  try {
    const groupsRef = collection(db, 'users', userId, 'groups');
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
 * グループの新規作成
 * @param userId ユーザーID
 * @param groupId グループID
 * @param groupName グループ名
 * @param groupColor グループ色
 * @param position Position値
 */
export const createFireStoreGroup = async (
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

/**
 * グループのPosition値を更新
 * @param userId ユーザーID
 * @param groupId グループID
 * @param position 新しいPosition値
 */
export const updateFireStoreGroupPosition = async (
  userId: string,
  groupId: string,
  position: number
) => {
  try {
    const groupRef = doc(db, 'users', userId, 'groups', groupId);
    await updateDoc(groupRef, {
      position
    });
    console.log(`Group ${groupId} position updated to ${position} in Firestore for user ${userId}`);
  } catch (error) {
    console.error('Error updating group position in Firestore:', error);
    throw error;
  }
};

/**
 * グループを削除
 * @param userId ユーザーID
 * @param groupId グループID
 */
export const deleteFireStoreGroup = async (userId: string, groupId: string) => {
  try {
    // TODO : あとで、グループに紐づくアイテムの削除もここで実行する
    const groupRef = doc(db, 'users', userId, 'groups', groupId);
    await deleteDoc(groupRef);
    console.log(`Group ${groupId} deleted from Firestore for user ${userId}`);
  } catch (error) {
    console.error('Error deleting group in Firestore:', error);
    throw error;
  }
};

/**
 * グループの全てを削除
 * @param userId ユーザーID
 */
export const deleteAllFireStoreGroup = async (userId: string) => {
  try {
    const groupsRef = collection(db, 'users', userId, 'groups');
    const snapshot = await getDocs(groupsRef);

    /* バッチ削除のための配列
      参考）Firestore（Web/モバイルのクライアントSDK）には「コレクションを一括削除する単一API」はありません。 ドキュメント単位で削除する必要があります。
      選択肢
        小〜中規模ならバッチ削除（推奨）
        writeBatch で500件ずつ削除します。Promise.all の並列削除は大量件数だとレート制限に当たりやすいので、バッチ＋分割が安全です。
        大規模 or サブコレクションごと再帰的に削除したい場合
        サーバー側（Admin SDK/Cloud Functions）で再帰削除処理を実装
        または CLI を使用: firebase firestore:delete <path> --recursive --project <yourProjectId> --force
        注意: サブコレクション
          deleteDoc はサブコレクションを削除しません。groups/{groupId}/items などがある場合は、再帰削除が必要です（Admin SDK/CLI推奨）。

    */
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
