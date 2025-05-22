const CreateGroupTable = `
CREATE TABLE IF NOT EXISTS groups
(
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL,
  created_at TEXT DEFAULT (DATETIME('now', 'localtime')),
  updated_at TEXT DEFAULT (DATETIME('now', 'localtime'))
)
`;

/**
 * Itemレコードの作成
 * @param id id
 * @param name グループ名
 * @param color 色
 */
const InsertGroup = `
  INSERT INTO groups (
    id, name, color
  ) VALUES (
    ?, ?, ?
  )
`;

/**
 * Itemレコードのカウント
 */
const CountGroups = `
  SELECT COUNT(*) FROM groups
`;

const GroupQueries = Object.freeze({
  CRATE_TABLE: CreateGroupTable,
  INSERT_GROUP: InsertGroup,
  COUNT_GROUPS: CountGroups
});

export { GroupQueries };
