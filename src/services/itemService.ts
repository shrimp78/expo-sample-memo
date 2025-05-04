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

export { createTable, createItem, countItems, getAllItems };
