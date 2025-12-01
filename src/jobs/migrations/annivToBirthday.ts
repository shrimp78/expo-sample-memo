import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, doc, getDoc, getDocs, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@root/firebaseConfig';
import { COLLECTION } from '@constants/firebaseCollectionName';
import {
  getCachedItems,
  setCachedItems,
  getCachedUserPreferences,
  setCachedUserPreferences
} from '@services/cache';
import { normalizeSortOptionId, type SortOptionId } from '@constants/sortOptions';

const MIGRATION_FLAG_KEY = (userId: string) => `migration:anniv-to-birthday:v1:${userId}`;
const FIRESTORE_BATCH_LIMIT = 400;

export async function runAnnivToBirthdayMigration(userId: string): Promise<void> {
  const flag = await AsyncStorage.getItem(MIGRATION_FLAG_KEY(userId));
  if (flag === 'done') {
    return;
  }

  await migrateCachedItems(userId);
  await migrateCachedUserPreferences(userId);
  await migrateFirestoreItems(userId);
  await migrateFirestoreUserPreferences(userId);

  await AsyncStorage.setItem(MIGRATION_FLAG_KEY(userId), 'done');
  console.log('[Migration] anniv -> birthday migration completed');
}

async function migrateCachedItems(userId: string): Promise<void> {
  const cachedItems = await getCachedItems(userId);
  if (!cachedItems || cachedItems.length === 0) {
    return;
  }

  await setCachedItems(userId, cachedItems);
  console.log('[Migration] Local items cache rewritten with birthday field');
}

async function migrateCachedUserPreferences(userId: string): Promise<void> {
  const cachedPreferences = await getCachedUserPreferences(userId);
  if (!cachedPreferences) {
    return;
  }

  await setCachedUserPreferences(userId, cachedPreferences);
  console.log('[Migration] Local user preferences cache normalized');
}

async function migrateFirestoreItems(userId: string): Promise<void> {
  const itemsRef = collection(db, COLLECTION.USERS, userId, COLLECTION.ITEMS);
  const snapshot = await getDocs(itemsRef);
  if (snapshot.empty) {
    return;
  }

  let batch = writeBatch(db);
  let pendingUpdates = 0;
  const batchCommits: Promise<void>[] = [];

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (!data?.birthday && data?.anniv) {
      batch.update(docSnap.ref, { birthday: data.anniv });
      pendingUpdates += 1;
    }

    if (pendingUpdates >= FIRESTORE_BATCH_LIMIT) {
      batchCommits.push(batch.commit());
      batch = writeBatch(db);
      pendingUpdates = 0;
    }
  });

  if (pendingUpdates > 0) {
    batchCommits.push(batch.commit());
  }

  await Promise.all(batchCommits);
  if (batchCommits.length > 0) {
    console.log('[Migration] Firestore items updated to birthday field');
  }
}

async function migrateFirestoreUserPreferences(userId: string): Promise<void> {
  const userRef = doc(db, COLLECTION.USERS, userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    return;
  }

  const currentPreference = userSnap.data()?.preferences?.itemSortOption;
  const normalized = normalizeSortOptionId(currentPreference);

  if (!normalized || normalized === (currentPreference as SortOptionId | undefined)) {
    return;
  }

  await updateDoc(userRef, {
    preferences: {
      ...(userSnap.data()?.preferences ?? {}),
      itemSortOption: normalized
    }
  });
  console.log('[Migration] Firestore user preferences normalized');
}
