import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

/**
 * SQLの引数
 */

export type SqlArgs = {
  sql: string;
  params?: (string | number | null)[];
};

// DB名
const DB_NAME = 'MtApp.db';

/**
 * DBのpathを取得
 * @returns DBのpath
 */

const getDbFilePath = () => {
  const path = FileSystem.documentDirectory + 'SQLite' + '/' + DB_NAME;
  return path;
};

/**
 * 更新系SQL処理
 * @param sqlArgs SQLの引数
 * @returns 実行結果
 */

const execute = async (...sqlArgs: SqlArgs[]): Promise<void> => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  const path = getDbFilePath();
  console.log(`execute start : path >> ${path}`);

  // 複数のクエリがある場合のみトランザクションを使用
  if (sqlArgs.length > 1) {
    await db.withTransactionAsync(async () => {
      for (const arg of sqlArgs) {
        const { sql, params } = arg;
        console.log(`execute sql >> ${sql}`);
        console.log(`execute params >> ${params}`);

        try {
          await db.runAsync(sql, ...(params || []));
        } catch (error) {
          console.error(`execute error >> ${error}`);
          throw error;
        }
      }
    });
  } else {
    // 単一のクエリの場合は直接実行
    const { sql, params } = sqlArgs[0];
    console.log(`execute sql >> ${sql}`);
    console.log(`execute params >> ${params}`);

    try {
      await db.runAsync(sql, ...(params || []));
    } catch (error) {
      console.error(`execute error >> ${error}`);
      throw error;
    }
  }
};

/**
 * 取得系SQL処理
 * @param sqlArgs SQLの引数
 * @returns 実行結果
 */

const fetch = async <T>(sqlArgs: SqlArgs): Promise<T[]> => {
  const { sql, params } = sqlArgs;
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  const path = getDbFilePath();
  console.log(`fetch start : path >> ${path}`);
  console.log(`fetch sql >> ${sql}`);

  try {
    const rows = await db.getAllAsync<T>(sql, ...(params || []));
    return rows;
  } catch (error) {
    console.error(`fetch error >> ${error}`);
    throw error;
  }
};
export { execute, fetch };
