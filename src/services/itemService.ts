import { execute, SqlArgs } from '../database/dbService';
import { ItemQueries } from '../database/queries/itemQueries';
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

export { createTable, createItem };
