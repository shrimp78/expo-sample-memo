/**
 * Itemテーブルを作成
 */

const CreateTableItems = `
  CREATE TABLE IF NOT EXISTS items
  (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    content    TEXT    NOT NULL,
    created_at TEXT    DEFAULT (DATETIME('now', 'localtime')),
    updated_at TEXT    DEFAULT (DATETIME('now', 'localtime'))
  )
`;

/**
 * Itemレコードの作成
 * @param title タイトル
 * @param content コンテンツ
 */

const InsertItem = `
  INSERT INTO items (
    title, content
  ) VALUES (
    ?, ?
  )
`;

/**
 * Itemレコードのカウント
 */

const CountItems = `
  SELECT COUNT(*) FROM items
`;

const ItemQueries = Object.freeze({
  CREATE_TABLE: CreateTableItems,
  INSERT: InsertItem,
  COUNT: CountItems
});

export { ItemQueries };
