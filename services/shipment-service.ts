// ============================================
// services/shipment-service.ts【新規】
// 出荷管理サービス
// ============================================

import { getConnection } from '@/lib/api-client';
import { RowDataPacket, OkPacket } from 'mysql2';

export interface ShipmentData {
  order_id: number;
  shipment_number: string;
  vehicle_count: number;
  shipment_date: string; // YYYY-MM-DD
  pickup_date?: string;
  delivery_date?: string;
  transport_company_id?: number;
  transport_cost: number;
  transport_notes?: string;
  status?: string;
}

export interface ShipmentResponse extends RowDataPacket {
  id: number;
  order_id: number;
  shipment_number: string;
  vehicle_count: number;
  shipment_date: string;
  pickup_date?: string;
  delivery_date?: string;
  transport_company_id?: number;
  transport_cost: number;
  transport_notes?: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * 出荷を作成
 */
export async function createShipment(
  data: ShipmentData,
  purchaseRecordIds: number[]
): Promise<number> {
  const connection = await getConnection();

  try {
    // トランザクション開始
    await connection.beginTransaction();

    // 出荷を作成
    const shipmentSql = `
      INSERT INTO shipments (
        order_id, shipment_number, vehicle_count,
        shipment_date, pickup_date, delivery_date,
        transport_company_id, transport_cost, transport_notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute<any>(shipmentSql, [
      data.order_id,
      data.shipment_number,
      data.vehicle_count,
      data.shipment_date,
      data.pickup_date || null,
      data.delivery_date || null,
      data.transport_company_id || null,
      data.transport_cost,
      data.transport_notes || null,
      data.status || 'confirmed',
    ]);

    const shipmentId = result.insertId as number;

    // 出荷仕入実績関連を作成
    if (purchaseRecordIds.length > 0) {
      for (const purchaseRecordId of purchaseRecordIds) {
        const linkSql = `
          INSERT INTO shipment_purchase_records (shipment_id, purchase_record_id)
          VALUES (?, ?)
        `;
        await connection.execute(linkSql, [shipmentId, purchaseRecordId]);
      }
    }

    // トランザクションコミット
    await connection.commit();

    return shipmentId;
  } catch (error) {
    // ロールバック
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 出荷を取得
 */
export async function getShipment(shipmentId: number): Promise<ShipmentResponse | null> {
  const connection = await getConnection();

  try {
    const sql = `
      SELECT * FROM shipments
      WHERE id = ? AND is_deleted = false
    `;
    const [rows] = await connection.execute<ShipmentResponse[]>(sql, [shipmentId]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    connection.release();
  }
}

/**
 * 受注の出荷一覧を取得
 */
export async function getShipmentsByOrder(
  orderId: number
): Promise<ShipmentResponse[]> {
  const connection = await getConnection();

  try {
    const sql = `
      SELECT * FROM shipments
      WHERE order_id = ? AND is_deleted = false
      ORDER BY created_at DESC
    `;
    const [rows] = await connection.execute<ShipmentResponse[]>(sql, [orderId]);
    return rows;
  } finally {
    connection.release();
  }
}

/**
 * すべての出荷を取得
 */
export async function getAllShipments(order_id: number | null): Promise<ShipmentResponse[]> {
  const connection = await getConnection();

  try {
    let sql = `
      SELECT * FROM shipments
      WHERE is_deleted = false
      ORDER BY created_at DESC
    `;
    const params: (number | null)[] = [];

    if (order_id !== null) {
      console.log('🔍 order_id に基づく出荷取得:', order_id);
      sql = `
        SELECT * FROM shipments
        WHERE is_deleted = false AND order_id = ?
        ORDER BY created_at DESC
      `;
      params.push(order_id);
    }

    const [rows] = await connection.execute<ShipmentResponse[]>(sql, params);
    return rows;
  } finally {
    connection.release();
  }
}

/**
 * 出荷に紐づいた仕入実績IDを取得
 */
export async function getShipmentPurchaseRecords(
  shipmentId: number
): Promise<number[]> {
  const connection = await getConnection();

  try {
    const sql = `
      SELECT purchase_record_id FROM shipment_purchase_records
      WHERE shipment_id = ?
    `;
    const [rows] = await connection.execute<any[]>(sql, [shipmentId]);
    return rows.map((row) => row.purchase_record_id);
  } finally {
    connection.release();
  }
}

/**
 * 出荷番号の次番を生成
 */
export async function generateNextShipmentNumber(): Promise<string> {
  const connection = await getConnection();

  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // 本日の出荷数を取得
    const sql = `
      SELECT COUNT(*) as count FROM shipments
      WHERE DATE(created_at) = CURDATE() AND is_deleted = false
    `;
    const [rows] = await connection.execute<any[]>(sql);
    const count = (rows[0]?.count || 0) + 1;
    const seq = String(count).padStart(4, '0');

    return `SHP-${dateStr}-${seq}`;
  } finally {
    connection.release();
  }
}