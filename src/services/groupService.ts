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
 * グループ情報を更新
 * @param params 更新パラメータ
 * @param params.id グループID（必須）
 * @param params.name 新しいグループ名（オプショナル）
 * @param params.color 新しい色（オプショナル）
 */
const updateGroup = async (params: { id: string; name?: string; color?: string }) => {
  const { id, name, color } = params;
  const updates: string[] = [];
  const sqlParams: any[] = [];

  if (name !== undefined) {
    updates.push('name = ?');
    sqlParams.push(name);
  }

  if (color !== undefined) {
    updates.push('color = ?');
    sqlParams.push(color);
  }

  if (updates.length === 0) {
    return; // 更新する項目がない場合は何もしない
  }

  sqlParams.push(id); // WHERE句のidパラメータ
  const sql = `UPDATE groups SET ${updates.join(', ')} WHERE id = ?`;

  await execute({ sql, params: sqlParams });
};

/**
 * 移動後のPosition値を計算(Trello方式)
 * @param toIndex 移動先のインデックス
 * @param groupsList グループリスト
 */
const calculateNewPosition = (toIndex: number, groupsList: Group[]): number => {
  if (toIndex === 0) {
    // 最初に移動する場合
    return groupsList[0].position / 2;
  } else if (toIndex === groupsList.length - 1) {
    // 最後に移動する場合
    return groupsList[groupsList.length - 1].position + 65536; // 新しい位置は前の位置より大きく
  } else {
    // 中間に移動する場合
    const prevPosition = groupsList[toIndex - 1].position;
    const nextPosition = groupsList[toIndex + 1].position;
    return (prevPosition + nextPosition) / 2;
  }
};

export {
  createTable,
  insertGroup,
  countGroups,
  getAllGroups,
  updateGroupPosition,
  getMaxPosition,
  getGroupById,
  updateGroup,
  calculateNewPosition
};
