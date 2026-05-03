// ============================================
// services/order-progress-service.ts【新規】
// 受注進捗管理サービス
// ============================================

import { getConnection } from "@/lib/api-client";
import { RowDataPacket, OkPacket } from "mysql2";

export interface OrderProgressData extends RowDataPacket {
  id: number;
  order_id: number;
  status: string;
  changed_at: Date;
  changed_by: number;
  notes: string | null;
  created_at: Date;
}

/**
 * 受注の進捗履歴を取得
 */
export async function getOrderProgress(
  orderId: number
): Promise<OrderProgressData[]> {
  const connection = await getConnection();

  try {
    const sql = `
      SELECT id, order_id, status, changed_at, changed_by, notes, created_at
      FROM order_progress 
      WHERE order_id = ? 
      ORDER BY changed_at DESC
    `;

    const [rows] = await connection.execute<OrderProgressData[]>(sql, [orderId]);
    return rows || [];
  } finally {
    connection.release();
  }
}

/**
 * 受注のステータスを更新
 */
export async function updateOrderStatus(
  orderId: number,
  newStatus: string,
  changedByUserId: number,
  notes?: string
): Promise<boolean> {
  const connection = await getConnection();

  try {
    // ステータスを更新
    const updateSql = `
      UPDATE orders 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const [result] = await connection.execute<OkPacket>(updateSql, [
      newStatus,
      orderId,
    ]);

    if (result.affectedRows === 0) {
      return false;
    }

    // 進捗履歴を記録
    const progressSql = `
      INSERT INTO order_progress (order_id, status, changed_by, notes, changed_at, created_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    await connection.execute(progressSql, [
      orderId,
      newStatus,
      changedByUserId,
      notes || null,
    ]);

    console.log(`✅ ステータス更新: Order ID=${orderId}, Status=${newStatus}`);

    return true;
  } catch (error) {
    console.error(`❌ ステータス更新エラー: ${error}`);
    return false;
  } finally {
    connection.release();
  }
}