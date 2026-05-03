// ============================================
// services/delivery-service.ts【新規】
// 納品書管理サービス
// ============================================

import { getConnection } from '@/lib/api-client';
import { RowDataPacket, OkPacket } from 'mysql2';

export interface DeliveryData {
  order_id: number;
  delivery_number: string;
  vehicle_count: number;
  delivery_date: string; // YYYY-MM-DD
  delivery_location?: string;
  total_amount: number;
  notes?: string;
  status?: string;
}

export interface DeliveryResponse extends RowDataPacket {
  id: number;
  order_id: number;
  delivery_number: string;
  vehicle_count: number;
  delivery_date: string;
  delivery_location?: string;
  total_amount: number;
  notes?: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * 納品書を作成
 */
export async function createDelivery(
  data: DeliveryData,
  purchaseRecordIds: number[]
): Promise<number> {
  const connection = await getConnection();

  try {
    // トランザクション開始
    await connection.beginTransaction();

    // 納品書を作成
    const deliverySql = `
      INSERT INTO deliveries (
        order_id, delivery_number, vehicle_count,
        delivery_date, delivery_location, total_amount, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute<any>(deliverySql, [
      data.order_id,
      data.delivery_number,
      data.vehicle_count,
      data.delivery_date,
      data.delivery_location || null,
      data.total_amount,
      data.notes || null,
      data.status || 'issued',
    ]);

    const deliveryId = result.insertId as number;

    // 納品書仕入実績関連を作成
    if (purchaseRecordIds.length > 0) {
      for (const purchaseRecordId of purchaseRecordIds) {
        const linkSql = `
          INSERT INTO delivery_purchase_records (delivery_id, purchase_record_id)
          VALUES (?, ?)
        `;
        await connection.execute(linkSql, [deliveryId, purchaseRecordId]);
      }
    }

    // トランザクションコミット
    await connection.commit();

    return deliveryId;
  } catch (error) {
    // ロールバック
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 納品書を取得
 */
export async function getDelivery(deliveryId: number): Promise<DeliveryResponse | null> {
  const connection = await getConnection();

  try {
    const sql = `
      SELECT * FROM deliveries
      WHERE id = ? AND is_deleted = false
    `;
    const [rows] = await connection.execute<DeliveryResponse[]>(sql, [deliveryId]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    connection.release();
  }
}

/**
 * 受注の納品書一覧を取得
 */
export async function getDeliveriesByOrder(
  orderId: number
): Promise<DeliveryResponse[]> {
  const connection = await getConnection();

  try {
    const sql = `
      SELECT * FROM deliveries
      WHERE order_id = ? AND is_deleted = false
      ORDER BY created_at DESC
    `;
    const [rows] = await connection.execute<DeliveryResponse[]>(sql, [orderId]);
    return rows;
  } finally {
    connection.release();
  }
}

/**
 * すべての納品書を取得
 */
export async function getAllDeliveries(): Promise<DeliveryResponse[]> {
  const connection = await getConnection();

  try {
    const sql = `
      SELECT * FROM deliveries
      WHERE is_deleted = false
      ORDER BY created_at DESC
    `;
    const [rows] = await connection.execute<DeliveryResponse[]>(sql);
    return rows;
  } finally {
    connection.release();
  }
}

/**
 * 納品書に紐づいた仕入実績IDを取得
 */
export async function getDeliveryPurchaseRecords(
  deliveryId: number
): Promise<number[]> {
  const connection = await getConnection();

  try {
    const sql = `
      SELECT purchase_record_id FROM delivery_purchase_records
      WHERE delivery_id = ?
    `;
    const [rows] = await connection.execute<any[]>(sql, [deliveryId]);
    return rows.map((row) => row.purchase_record_id);
  } finally {
    connection.release();
  }
}

/**
 * 納品書番号の次番を生成
 */
export async function generateNextDeliveryNumber(): Promise<string> {
  const connection = await getConnection();

  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // 本日の納品書数を取得
    const sql = `
      SELECT COUNT(*) as count FROM deliveries
      WHERE DATE(created_at) = CURDATE() AND is_deleted = false
    `;
    const [rows] = await connection.execute<any[]>(sql);
    const count = (rows[0]?.count || 0) + 1;
    const seq = String(count).padStart(4, '0');

    return `DEL-${dateStr}-${seq}`;
  } finally {
    connection.release();
  }
}