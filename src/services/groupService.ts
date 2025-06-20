import { execute, fetch } from '../database/dbService';
import { GroupQueries } from '../database/queries/groupQueries';
import { type Group } from '../components/types/group';
import { type GroupSchema } from '../database/schemas/groupSchema';

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
const insertGroup = async (id: string, name: string, color: string, position: number) => {
  await execute({ sql: GroupQueries.INSERT_GROUP, params: [id, name, color, position] });
};

/**
 * Itemレコードのカウント
 */
const countGroups = async (): Promise<number> => {
  const result = await fetch<{ 'COUNT(*)': number }>({
    sql: GroupQueries.COUNT_GROUPS
  });
  const count = result.map(row => row['COUNT(*)']);
  return count[0];
};

/**
 * 全てのGroupを取得
 */
const getAllGroups = async (): Promise<Group[]> => {
  const rows = await fetch<GroupSchema>({ sql: GroupQueries.GET_ALL_GROUPS });
  const groups = rows.map((row): Group => {
    return {
      id: row.id,
      name: row.name,
      color: row.color,
      position: row.position
    };
  });
  return groups;
};

export { createTable, insertGroup, countGroups, getAllGroups };
