import { execute, fetch } from '../database/dbService';
import { GroupQueries } from '../database/queries/groupQueries';

/**
 * グループテーブルを作成
 */
const createTable = async () => {
  await execute({ sql: GroupQueries.CRATE_TABLE });
};

/**
 * Itemレコードのカウント
 */
const countGroups = async (): Promise<number> => {
  const result = await fetch<{ 'COUNT(*)': number }>({ sql: GroupQueries.COUNT_GROUPS });
  const count = result.map(row => row['COUNT(*)']);
  return count[0];
};

export { createTable, countGroups };
