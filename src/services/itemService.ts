import { execute } from '../database/dbService';
import { ItemQueries } from '../database/queries/itemQueries';
/**
 * Itemテーブルの作成
 */
const createTable = async () => {
  await execute({ sql: ItemQueries.CREATE_TABLE });
};

export { createTable };
