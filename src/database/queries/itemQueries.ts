/**
 * Itemテーブルを作成
 */

const CreateTableItems = `
  CREATE TABLE IF NOT EXISTS items
  (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL,
    content    TEXT NOT NULL,
    createdAt  DATETIME NOT NULL,
    updatedAt  DATETIME NOT NULL
  )
`;

const ItemQueries = Object.freeze({
  CREATE_TABLE: CreateTableItems
});

export { ItemQueries };
