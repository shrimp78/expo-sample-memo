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

/**
 * グループのposition値を更新
 * @param id グループID
 * @param position 新しいposition値
 */
const updateGroupPosition = async (id: string, position: number) => {
  await execute({ sql: GroupQueries.UPDATE_GROUP_POSITION, params: [position, id] });
};

/**
 * 現在のグループの最大position値を取得
 * @returns 最大position値（グループが存在しない場合は0）
 */
const getMaxPosition = async (): Promise<number> => {
  const result = await fetch<{ max_position: number | null }>({
    sql: GroupQueries.GET_MAX_POSITION
  });

  // グループが存在しない場合はnullが返されるので、0を返す
  return result[0]?.max_position ?? 0;
};

/**
 * IDでグループを取得
 * @param id グループID
 * @returns グループ情報
 */
const getGroupById = async (id: string): Promise<Group | null> => {
  const rows = await fetch<GroupSchema>({ sql: GroupQueries.GET_GROUP_BY_ID, params: [id] });
  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    position: row.position
  };
};

/**
 * グループ名を更新
 * @param id グループID
 * @param name 新しいグループ名
 */
const updateGroupName = async (id: string, name: string) => {
  await execute({ sql: GroupQueries.UPDATE_GROUP_NAME, params: [name, id] });
};

export {
  createTable,
  insertGroup,
  countGroups,
  getAllGroups,
  updateGroupPosition,
  getMaxPosition,
  getGroupById,
  updateGroupName
};
