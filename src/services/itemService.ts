import { execute, fetch, SqlArgs } from '../database/dbService';
import { ItemQueries } from '../database/queries/itemQueries';
import { type ItemSchema } from '../database/schemas/itemSchema';
import { type Item } from '../components/types/item';

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
 */
const createItem = async (title: string, content: string) => {
  let queries: SqlArgs[] = [];
  queries.push({ sql: ItemQueries.INSERT, params: [title, content] });
  await execute(...queries);
};

/**
 * Itemレコードのカウント
 */
const countItems = async (): Promise<number> => {
  const result = await fetch<{ 'COUNT(*)': number }>({ sql: ItemQueries.COUNT });
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
      content: row.content
    };
  });
  return items;
};

/**
 * 指定されたIDのItemを取得
 * @param id アイテムのID
 */
const getItemById = async (id: number): Promise<Item> => {
  const rows = await fetch<ItemSchema>({ sql: ItemQueries.GET_ITEM_BY_ID, params: [id] });
  if (rows.length === 0) {
    throw new Error('Item not found');
  }
  const item = {
    id: rows[0].id,
    title: rows[0].title,
    content: rows[0].content
  };
  return item;
};

export { createTable, createItem, countItems, getAllItems, getItemById };
