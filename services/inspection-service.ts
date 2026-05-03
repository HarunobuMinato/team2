// ============================================
// services/inspection-service.ts【新規】
// 検収管理サービス
// ============================================

import { getConnection } from '@/lib/api-client';
import { RowDataPacket } from 'mysql2';

export interface InspectionData {
  delivery_id: number;
  received_date?: string; // YYYY-MM-DD
  inspection_date?: string; // YYYY-MM-DD
  inspection_result: 'pending' | 'ok' | 'ng' | 'completed';
  inspection_notes?: string;
}

export interface InspectionResponse extends RowDataPacket {
  id: number;
  delivery_id: number;
  received_date?: string;
  inspection_date?: string;
  inspection_result: string;
  inspection_notes?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * 検収を作成または更新
 */
export async function createOrUpdateInspection(
  data: InspectionData
): Promise<number> {
  const connection = await getConnection();

  try {
    // 既存の検収を確認
    const checkSql = `
      SELECT id FROM inspections
      WHERE delivery_id = ? AND is_deleted = false
    `;

    const [existingRows] = await connection.execute<any[]>(checkSql, [
      data.delivery_id,
    ]);

    if (existingRows.length > 0) {
      // 更新
      const updateSql = `
        UPDATE inspections
        SET received_date = ?, inspection_date = ?, 
            inspection_result = ?, inspection_notes = ?
        WHERE delivery_id = ? AND is_deleted = false
      `;

      await connection.execute(updateSql, [
        data.received_date || null,
        data.inspection_date || null,
        data.inspection_result,
        data.inspection_notes || null,
        data.delivery_id,
      ]);

      return existingRows[0].id;
    } else {
      // 作成
      const insertSql = `
        INSERT INTO inspections (
          delivery_id, received_date, inspection_date,
          inspection_result, inspection_notes
        ) VALUES (?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute<any>(insertSql, [
        data.delivery_id,
        data.received_date || null,
        data.inspection_date || null,
        data.inspection_result,
        data.inspection_notes || null,
      ]);

      return result.insertId;
    }
  } finally {
    connection.release();
  }
}

/**
 * 検収を取得
 */
export async function getInspection(
  deliveryId: number
): Promise<InspectionResponse | null> {
  const connection = await getConnection();

  try {
    const sql = `
      SELECT * FROM inspections
      WHERE delivery_id = ? AND is_deleted = false
    `;
    const [rows] = await connection.execute<InspectionResponse[]>(sql, [
      deliveryId,
    ]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    connection.release();
  }
}

/**
 * 納品書の検収結果を取得
 */
export async function getDeliveryInspectionStatus(
  deliveryId: number
): Promise<{ inspection: InspectionResponse | null; delivery: any | null }> {
  const connection = await getConnection();

  try {
    // 検収情報を取得
    const inspectionSql = `
      SELECT * FROM inspections
      WHERE delivery_id = ? AND is_deleted = false
    `;
    const [inspectionRows] = await connection.execute<InspectionResponse[]>(
      inspectionSql,
      [deliveryId]
    );

    // 納品書情報を取得
    const deliverySql = `
      SELECT * FROM deliveries
      WHERE id = ? AND is_deleted = false
    `;
    const [deliveryRows] = await connection.execute<any[]>(deliverySql, [
      deliveryId,
    ]);

    return {
      inspection: inspectionRows.length > 0 ? inspectionRows[0] : null,
      delivery: deliveryRows.length > 0 ? deliveryRows[0] : null,
    };
  } finally {
    connection.release();
  }
}