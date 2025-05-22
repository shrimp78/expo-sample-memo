import { execute, fetch } from '../database/dbService';
import { GroupQueries } from '../database/queries/groupQueries';

/**
 * グループテーブルを作成
 */
const createTable = async () => {
  await execute({ sql: GroupQueries.CRATE_TABLE });
};

/**
 * グループレコードの作成
 * @param id id
 * @param name グループ名
 * @param color 色
 */
const insertGroup = async (id: string, name: string, color: string) => {
  await execute({ sql: GroupQueries.INSERT_GROUP, params: [id, name, color] });
};

/**
 * Itemレコードのカウント
 */
const countGroups = async (): Promise<number> => {
  const result = await fetch<{ 'COUNT(*)': number }>({ sql: GroupQueries.COUNT_GROUPS });
  const count = result.map(row => row['COUNT(*)']);
  return count[0];
};

export { createTable, insertGroup, countGroups };
