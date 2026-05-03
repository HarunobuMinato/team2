// ============================================
// services/purchase-service.ts【追加関数版】
// ============================================

import { getConnection } from '@/lib/api-client';
import { RowDataPacket, OkPacket } from 'mysql2';

/**
 * トランザクション処理を実行
 */
async function executeTransaction<T>(
  callback: (connection: any) => Promise<T>
): Promise<T> {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.release();
  }
}

export interface PurchaseRecordData {
  order_id: number;
  desired_vehicle_id?: number;
  sequence_number: number;
  vehicle_name: string;
  maker?: string;
  model?: string;
  year?: number;
  mileage?: number;
  inspection_date?: string;
  color?: string;
  body_color?: string;
  transmission?: string;
  engine?: string;
  chassis_number?: string;
  registration_number?: string;
  auction_date: string;
  bid_price: number;
  bid_date?: string;
  tax_amount?: number;
  bid_fee?: number;
  status?: string;
  variance_reason?: string;
  notes?: string;
}

export interface PurchaseRecordResponse extends RowDataPacket {
  id: number;
  order_id: number;
  sequence_number: number;
  vehicle_name: string;
  maker: string | null;
  model: string | null;
  year: number | null;
  mileage: number | null;
  color: string | null;
  body_color: string | null;
  transmission: string | null;
  engine: string | null;
  auction_date: string;
  bid_price: number;
  bid_date: string | null;
  tax_amount: number;
  bid_fee: number;
  total_purchase_price: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * 【新規】仕入実績を全件取得
 */
export async function getAllPurchaseRecords(): Promise<PurchaseRecordResponse[]> {
  const connection = await getConnection();

  try {
    const sql = `
      SELECT * FROM purchase_records 
      WHERE is_deleted = false
      ORDER BY created_at DESC
    `;
    const [rows] = await connection.execute<PurchaseRecordResponse[]>(sql);
    return rows;
  } finally {
    connection.release();
  }
}

/**
 * 【新規】仕入実績を取得（ページネーション対応）
 */
export async function getPurchaseRecordsWithPagination(
  page: number = 1,
  limit: number = 20
): Promise<{
  records: PurchaseRecordResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const connection = await getConnection();

  try {
    // 総件数を取得
    const [countResult] = await connection.execute<any[]>(
      'SELECT COUNT(*) as total FROM purchase_records WHERE is_deleted = false'
    );
    const total = countResult[0]?.total || 0;

    // オフセットを計算
    const offset = (page - 1) * limit;

    // データを取得
    const sql = `
      SELECT * FROM purchase_records 
      WHERE is_deleted = false
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await connection.execute<PurchaseRecordResponse[]>(sql, [limit, offset]);

    const totalPages = Math.ceil(total / limit);

    return {
      records: rows,
      total,
      page,
      limit,
      totalPages,
    };
  } finally {
    connection.release();
  }
}

/**
 * 【新規】仕入実績を検索（order_id、vehicle_name、ステータスなど）
 */
export async function searchPurchaseRecords(filters: {
  order_id?: number;
  vehicle_name?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<{
  records: PurchaseRecordResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const connection = await getConnection();

  try {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE is_deleted = false';
    const params: any[] = [];

    if (filters.order_id) {
      whereClause += ' AND order_id = ?';
      params.push(filters.order_id);
    }

    if (filters.vehicle_name) {
      whereClause += ' AND vehicle_name LIKE ?';
      params.push(`%${filters.vehicle_name}%`);
    }

    if (filters.status) {
      whereClause += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.startDate) {
      whereClause += ' AND auction_date >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      whereClause += ' AND auction_date <= ?';
      params.push(filters.endDate);
    }

    // 総件数を取得
    const [countResult] = await connection.execute<any[]>(
      `SELECT COUNT(*) as total FROM purchase_records ${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    // データを取得
    const sql = `
      SELECT * FROM purchase_records 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await connection.execute<PurchaseRecordResponse[]>(
      sql,
      [...params, limit, offset]
    );

    const totalPages = Math.ceil(total / limit);

    return {
      records: rows,
      total,
      page,
      limit,
      totalPages,
    };
  } finally {
    connection.release();
  }
}

/**
 * 仕入実績を作成（追加費用対応）
 */
export async function createPurchaseRecord(
  data: PurchaseRecordData
): Promise<number> {
  return await executeTransaction(async (connection) => {
    const taxAmount = data.tax_amount || 0;
    const bidFee = data.bid_fee || 0;
    const totalPurchasePrice = data.bid_price + taxAmount + bidFee;

    const sql = `
      INSERT INTO purchase_records (
        order_id, desired_vehicle_id, sequence_number,
        vehicle_name, maker, model, year, mileage, inspection_date,
        color, body_color, transmission, engine,
        chassis_number, registration_number,
        auction_date, bid_price, bid_date, 
        tax_amount, bid_fee, total_purchase_price,
        status, variance_reason, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute(sql, [
      data.order_id,
      data.desired_vehicle_id || null,
      data.sequence_number,
      data.vehicle_name,
      data.maker || null,
      data.model || null,
      data.year || null,
      data.mileage || null,
      data.inspection_date || null,
      data.color || null,
      data.body_color || null,
      data.transmission || null,
      data.engine || null,
      data.chassis_number || null,
      data.registration_number || null,
      data.auction_date,
      data.bid_price,
      data.bid_date || null,
      taxAmount,
      bidFee,
      totalPurchasePrice,
      data.status || 'pending',
      data.variance_reason || null,
      data.notes || null,
    ]);

    const purchaseRecordId = (result as any).insertId as number;

    const [order] = await connection.execute(
      'SELECT purchase_record_ids FROM orders WHERE id = ?',
      [data.order_id]
    );

    if (order.length > 0) {
      const ids = JSON.parse(order[0].purchase_record_ids || '[]');
      ids.push(purchaseRecordId); 
      await connection.execute(
        'UPDATE orders SET purchase_record_ids = ? WHERE id = ?',
        [JSON.stringify(ids), data.order_id]
      );
    }

    return purchaseRecordId;
  });
}

/**
 * 仕入実績を取得（単件）
 */
export async function getPurchaseRecord(
  recordId: number
): Promise<PurchaseRecordResponse | null> {
  const connection = await getConnection();

  try {
    const sql = 'SELECT * FROM purchase_records WHERE id = ? AND is_deleted = false';
    const [rows] = await connection.execute<PurchaseRecordResponse[]>(sql, [recordId]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    connection.release();
  }
}

/**
 * 受注の仕入実績一覧を取得
 */
export async function getPurchaseRecordsByOrder(
  orderId: number
): Promise<PurchaseRecordResponse[]> {
  const connection = await getConnection();

  try {
    const sql = `
      SELECT * FROM purchase_records 
      WHERE order_id = ? AND is_deleted = false
      ORDER BY sequence_number ASC
    `;
    const [rows] = await connection.execute<PurchaseRecordResponse[]>(sql, [orderId]);
    return rows;
  } finally {
    connection.release();
  }
}

/**
 * 仕入実績を更新（追加費用対応）
 */
export async function updatePurchaseRecord(
  recordId: number,
  data: Partial<PurchaseRecordData>
): Promise<boolean> {
  const connection = await getConnection();

  try {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.status) {
      updates.push('status = ?');
      params.push(data.status);
    }

    if (data.tax_amount !== undefined) {
      updates.push('tax_amount = ?');
      params.push(data.tax_amount);
    }

    if (data.bid_fee !== undefined) {
      updates.push('bid_fee = ?');
      params.push(data.bid_fee);
    }

    if (
      data.bid_price !== undefined ||
      data.tax_amount !== undefined ||
      data.bid_fee !== undefined
    ) {
      const [currentRecord] = await connection.execute<any[]>(
        'SELECT bid_price, tax_amount, bid_fee FROM purchase_records WHERE id = ?',
        [recordId]
      );

      if (currentRecord.length > 0) {
        const bidPrice = data.bid_price ?? currentRecord[0].bid_price;
        const taxAmount = data.tax_amount ?? currentRecord[0].tax_amount;
        const bidFee = data.bid_fee ?? currentRecord[0].bid_fee;
        const totalPurchasePrice = bidPrice + taxAmount + bidFee;

        updates.push('total_purchase_price = ?');
        params.push(totalPurchasePrice);
      }
    }

    if (data.body_color) {
      updates.push('body_color = ?');
      params.push(data.body_color);
    }

    if (data.transmission) {
      updates.push('transmission = ?');
      params.push(data.transmission);
    }

    if (data.engine) {
      updates.push('engine = ?');
      params.push(data.engine);
    }

    if (data.notes !== undefined) {
      updates.push('notes = ?');
      params.push(data.notes);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(recordId);

    const sql = `
      UPDATE purchase_records SET ${updates.join(', ')} WHERE id = ?
    `;

    const [result] = await connection.execute<OkPacket>(sql, params);
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

/**
 * 仕入総額を取得（複数レコード）
 */
export async function getTotalPurchasePrice(
  purchaseRecordIds: number[]
): Promise<number> {
  if (purchaseRecordIds.length === 0) return 0;

  const connection = await getConnection();

  try {
    const placeholders = purchaseRecordIds.map(() => '?').join(',');
    const sql = `
      SELECT SUM(total_purchase_price) as total
      FROM purchase_records
      WHERE id IN (${placeholders}) AND is_deleted = false
    `;

    const [rows] = await connection.execute<any[]>(sql, purchaseRecordIds);
    return rows[0]?.total || 0;
  } finally {
    connection.release();
  }
}