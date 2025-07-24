import { execute, fetch, SqlArgs } from '../database/dbService';
import { ItemQueries } from '../database/queries/itemQueries';
import { type ItemSchema } from '../database/schemas/itemSchema';
import { type Item } from '../components/types/Item';

/**
 * Itemテーブルの作成
 */
const createTable = async () => {
  await execute({ sql: ItemQueries.CREATE_TABLE });
};

/**
 * Itemレコードの作成
 * @param title タイトル
 * @param content コンテンツ
 * @param group_id グループID(nullの場合はundefined)
 */
const createItem = async (id: string, title: string, content: string, group_id: string | null) => {
  let queries: SqlArgs[] = [];
  // Itemの追加
  queries.push({ sql: ItemQueries.INSERT, params: [id, title.trim(), content] });
  // GroupIDの追加
  if (group_id !== undefined) {
    queries.push({
      sql: ItemQueries.UPDATE_ITEM_GROUP_BY_ID,
      params: [group_id, id]
    });
  }
  await execute(...queries);
};

/**
 * Itemレコードのカウント
 */
const countItems = async (): Promise<number> => {
  const result = await fetch<{ 'COUNT(*)': number }>({
    sql: ItemQueries.COUNT
  });
  const count = result.map(row => row['COUNT(*)']);
  return count[0];
};

/**
 * 指定されたグループIDのアイテム数を取得
 * @param group_id グループID
 */
const countItemsByGroupId = async (group_id: string): Promise<number> => {
  const result = await fetch<{ 'COUNT(*)': number }>({
    sql: ItemQueries.COUNT_BY_GROUP_ID,
    params: [group_id]
  });
  const count = result.map(row => row['COUNT(*)']);
  return count[0];
};

/**
 * 全てのItemを取得
 */
const getAllItems = async (): Promise<Item[]> => {
  const rows = await fetch<ItemSchema>({ sql: ItemQueries.GET_ALL_ITEMS });
  const items = rows.map((row): Item => {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      group_id: row.group_id
    };
  });
  return items;
};

/**
 * 指定されたIDのItemを取得
 * @param id アイテムのID
 */
const getItemById = async (id: string): Promise<Item> => {
  const rows = await fetch<ItemSchema>({
    sql: ItemQueries.GET_ITEM_BY_ID,
    params: [id]
  });
  if (rows.length === 0) {
    throw new Error('Item not found');
  }
  const item = {
    id: rows[0].id,
    title: rows[0].title,
    content: rows[0].content,
    group_id: rows[0].group_id
  };
  return item;
};

/**
 * 指定されたIDのItemを更新
 * @param id アイテムのID
 * @param title タイトル
 * @param content コンテンツ
 * @param group_id グループID(nullの場合はundefined)
 */
const updateItemById = async (
  id: string,
  title: string,
  content: string,
  group_id: string | null
) => {
  await execute({
    sql: ItemQueries.UPDATE_ITEM_BY_ID,
    params: [title.trim(), content, group_id, id]
  });
};

/**
 * 指定されたIDのItemを削除
 * @param id アイテムのID
 */
const deleteItemById = async (id: string) => {
  await execute({ sql: ItemQueries.DELETE_ITEM_BY_ID, params: [id] });
};

/**
 * 指定されたグループIDのアイテムをすべて削除
 * @param group_id グループID
 */
const deleteItemsByGroupId = async (group_id: string) => {
  await execute({ sql: ItemQueries.DELETE_ITEMS_BY_GROUP_ID, params: [group_id] });
};

/**
 * Itemテーブルのデータを全件削除
 */
const deleteAllItems = async () => {
  await execute({ sql: ItemQueries.DELETE_ALL_ITEMS });
};

export {
  createTable,
  createItem,
  countItems,
  countItemsByGroupId,
  getAllItems,
  getItemById,
  updateItemById,
  deleteItemById,
  deleteItemsByGroupId,
  deleteAllItems
};
