/**
 * Itemテーブルを作成
 */
const CreateTableItems = `
  CREATE TABLE IF NOT EXISTS items
  (
    id         TEXT    PRIMARY KEY,
    title      TEXT    NOT NULL,
    content    TEXT    NOT NULL,
    group_id   TEXT,
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
    id, title, content
  ) VALUES (
    ?, ?, ?
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
 * @param title タイトル
 * @param content コンテンツ
 * @param group_id グループID
 * @param id アイテムのID
 */
const UpdateItemById = `
  UPDATE
    items
  SET
    title = ?,
    content = ?,
    group_id = ?,
    updated_at = DATETIME('now', 'localtime')
  WHERE
    id = ?
`;

/**
 * 指定されたIDのItemのグループIDを更新
 * @param group_id グループID
 * @param id アイテムのID
 */
const UpdateItemGroupById = `
  UPDATE
    items
  SET
    group_id = ?
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

/**
 * 指定されたグループIDのアイテムをすべて削除
 * @param group_id グループID
 */
const DeleteItemsByGroupId = `
  DELETE FROM items WHERE group_id = ?
`;

/**
 * Itemテーブルのデータを全件削除
 */
const DeleteAllItems = `
  DELETE FROM items
`;

const ItemQueries = Object.freeze({
  CREATE_TABLE: CreateTableItems,
  INSERT: InsertItem,
  COUNT: CountItems,
  GET_ALL_ITEMS: GetAllItems,
  GET_ITEM_BY_ID: GetItemById,
  UPDATE_ITEM_BY_ID: UpdateItemById,
  UPDATE_ITEM_GROUP_BY_ID: UpdateItemGroupById,
  DELETE_ITEM_BY_ID: DeleteItemById,
  DELETE_ITEMS_BY_GROUP_ID: DeleteItemsByGroupId,
  DELETE_ALL_ITEMS: DeleteAllItems
});

export { ItemQueries };
