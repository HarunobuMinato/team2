import pool from './database';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface FilterParams {
  status?: string;
  client_id?: number;
  from_date?: string;
  to_date?: string;
  [key: string]: any;
}

/**
 * データベースコネクション取得
 */
export async function getConnection() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

/**
 * トランザクション実行
 */
export async function executeTransaction<T>(
  callback: (connection: any) => Promise<T>
) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * ページネーション用オフセット計算
 */
export function calculateOffset(page: number = 1, limit: number = 20): number {
  return (Math.max(1, page) - 1) * limit;
}