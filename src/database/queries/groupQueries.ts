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

const GroupQueries = Object.freeze({
  CRATE_TABLE: CreateGroupTable
});

export { GroupQueries };
