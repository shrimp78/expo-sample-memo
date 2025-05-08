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

/**
 * 全てのItemを取得
 */
const GetAllItems = `
  SELECT * FROM items ORDER BY updated_at DESC
`;

/**
 * 指定されたIDのItemを取得
 * @param id アイテムのID
 */
const GetItemById = `
  SELECT * FROM items WHERE id = ?
`;

/**
 * 指定されたIDのItemの更新
 * @param id アイテムのID
 * @param title タイトル
 * @param content コンテンツ
 */
const UpdateItemById = `
  UPDATE
    items
  SET
    title = ?,
    content = ?,
    updated_at = DATETIME('now', 'localtime')
  WHERE
    id = ?
`;

/**
 * 指定されたIDのItemを削除
 * @param id アイテムのID
 */
const DeleteItemById = `
  DELETE FROM items WHERE id = ?
`;

const ItemQueries = Object.freeze({
  CREATE_TABLE: CreateTableItems,
  INSERT: InsertItem,
  COUNT: CountItems,
  GET_ALL_ITEMS: GetAllItems,
  GET_ITEM_BY_ID: GetItemById,
  UPDATE_ITEM_BY_ID: UpdateItemById,
  DELETE_ITEM_BY_ID: DeleteItemById
});

export { ItemQueries };
