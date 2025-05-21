import { execute, fetch } from '../database/dbService';
import { GroupQueries } from '../database/queries/groupQueries';

/**
 * グループテーブルを作成
 */
const createTable = async () => {
  await execute({ sql: GroupQueries.CRATE_TABLE });
};

export { createTable };
