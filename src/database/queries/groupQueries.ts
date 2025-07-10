const CreateGroupTable = `
CREATE TABLE IF NOT EXISTS groups
(
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL,
  position   REAL NOT NULL,
  created_at TEXT DEFAULT (DATETIME('now', 'localtime')),
  updated_at TEXT DEFAULT (DATETIME('now', 'localtime'))
)
`;

/**
 * Itemレコードの作成
 * @param id id
 * @param name グループ名
 * @param color 色
 * @param position 位置
 */
const InsertGroup = `
  INSERT INTO groups (
    id, name, color, position
  ) VALUES (
    ?, ?, ?, ?
  )
`;

/**
 * Itemレコードのカウント
 */
const CountGroups = `
  SELECT COUNT(*) FROM groups
`;

/**
 * 全てのItemを取得
 */
const GetAllGroups = `
  SELECT * FROM groups ORDER BY position ASC
`;

/**
 * IDでグループを取得
 */
const GetGroupById = `
  SELECT * FROM groups WHERE id = ?
`;

/**
 * グループのposition値を更新
 */
const UpdateGroupPosition = `
  UPDATE groups SET position = ?, updated_at = DATETIME('now', 'localtime') WHERE id = ?
`;

/**
 * グループ名を更新
 */
const UpdateGroupName = `
  UPDATE groups SET name = ?, updated_at = DATETIME('now', 'localtime') WHERE id = ?
`;

/**
 * 最大position値を取得
 */
const GetMaxPosition = `
  SELECT MAX(position) as max_position FROM groups
`;

/**
 * Groupテーブルのデータを全件削除
 */
const DeleteAllGroups = `
  DELETE FROM groups
`;

/**
 * グループを削除
 */
const DeleteGroup = `
  DELETE FROM groups WHERE id = ?
`;

const GroupQueries = Object.freeze({
  CRATE_TABLE: CreateGroupTable,
  INSERT_GROUP: InsertGroup,
  COUNT_GROUPS: CountGroups,
  GET_ALL_GROUPS: GetAllGroups,
  GET_GROUP_BY_ID: GetGroupById,
  GET_MAX_POSITION: GetMaxPosition,
  UPDATE_GROUP_NAME: UpdateGroupName,
  UPDATE_GROUP_POSITION: UpdateGroupPosition,
  DELETE_ALL_GROUPS: DeleteAllGroups,
  DELETE_GROUP: DeleteGroup
});

export { GroupQueries };
