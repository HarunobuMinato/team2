import { getConnection, executeTransaction } from "@/lib/api-client";
import { RowDataPacket, OkPacket } from "mysql2";

export interface OrderData {
  order_number: string;
  order_type: "buy" | "sell" | "mediation";
  client_id: number;
  sales_person_id: number;
  status?: string; // デフォルト: 'order_pending'
  order_date: string;
  desired_delivery_date?: string;
  vehicle_count: number;
  notes?: string;
}

export interface OrderResponse extends RowDataPacket {
  id: number;
  order_number: string;
  order_type: string;
  client_id: number;
  status: string;
  order_date: string;
  desired_delivery_date: string | null;
  vehicle_count: number;
  purchase_record_ids: string;
  confirmed_by_client: boolean;
  confirmed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export async function createOrder(
  data: OrderData,
  connection?: any,
): Promise<number> {
  const conn = connection || (await getConnection());

  try {
    const sql = `
      INSERT INTO orders (
        order_number, order_type, client_id, sales_person_id,
        status, order_date, desired_delivery_date, vehicle_count,
        purchase_record_ids, notes, confirmed_by_client
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await conn.execute(sql, [
      data.order_number,
      data.order_type,
      data.client_id,
      data.sales_person_id,
      "order_pending", // デフォルトステータス：確認待ち
      data.order_date,
      data.desired_delivery_date || null,
      data.vehicle_count,
      JSON.stringify([]),
      data.notes || null,
      false, // 確認フラグ：未確認
    ]);

    const orderId = result.insertId as number;

    // 進捗履歴を作成
    await createOrderProgress(
      conn,
      orderId,
      "order_pending",
      data.sales_person_id,
      "受注確認待ち",
    );

    return orderId;
  } finally {
    if (!connection) {
      conn.release();
    }
  }
}

// 【新規】非同期版の createOrderProgress
async function createOrderProgress(
  connection: any,
  orderId: number,
  status: string,
  changedByUserId: number,
  notes: string | null,
): Promise<number> {
  const sql = `
    INSERT INTO order_progress (order_id, status, changed_by, notes, changed_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

  const [result] = await connection.execute(sql, [
    orderId,
    status,
    changedByUserId,
    notes,
  ]);

  return result.insertId as number;
}

/**
 * 受注を取得
 */
export async function getOrder(orderId: number): Promise<OrderResponse | null> {
  const connection = await getConnection();

  try {
    const sql = "SELECT * FROM orders WHERE id = ? AND is_deleted = false";
    const [rows] = await connection.execute<OrderResponse[]>(sql, [orderId]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    connection.release();
  }
}

/**
 * 受注一覧を取得
 */
export async function getOrders(
  clientId?: number,
  status?: string,
  limit: number = 20,
  offset: number = 0,
): Promise<OrderResponse[]> {
  const connection = await getConnection();

  try {
    let sql = "SELECT * FROM orders WHERE is_deleted = false";
    const params: any[] = [];

    if (clientId) {
      sql += " AND client_id = ?";
      params.push(clientId);
    }

    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await connection.execute<OrderResponse[]>(sql, params);
    return rows;
  } finally {
    connection.release();
  }
}

/**
 * 受注を更新
 */
export async function updateOrder(
  orderId: number,
  data: Partial<OrderData> & { status?: string },
  changedByUserId: number,
): Promise<boolean> {
  const connection = await getConnection();

  try {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.status) {
      updates.push("status = ?");
      params.push(data.status);
    }
    if (data.notes !== undefined) {
      updates.push("notes = ?");
      params.push(data.notes);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    params.push(orderId);

    const sql = `
      UPDATE orders SET ${updates.join(", ")} WHERE id = ?
    `;

    const [result] = await connection.execute<OkPacket>(sql, params);

    if (data.status) {
      await createOrderProgress(
        connection,
        orderId,
        data.status,
        changedByUserId,
        null,
      );
    }

    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

/**
 * 顧客が受注を確認（order_pending → ordered）
 */
export async function confirmOrderByClient(orderId: number): Promise<boolean> {
  const connection = await getConnection();

  try {
    const sql = `
      UPDATE orders 
      SET status = 'ordered', 
          confirmed_by_client = true,
          confirmed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const [result] = await connection.execute<OkPacket>(sql, [orderId]);

    if (result.affectedRows > 0) {
      // 進捗履歴を作成
      const [userIdResult] = await connection.execute<any[]>(
        "SELECT sales_person_id FROM orders WHERE id = ?",
        [orderId],
      );

      if (userIdResult.length > 0) {
        await createOrderProgress(
          connection,
          orderId,
          "ordered",
          userIdResult[0].sales_person_id,
          "顧客が受注を確認しました",
        );
      }
    }

    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

/**
 * 仕入実績IDリストを更新
 */
export async function updatePurchaseRecordIds(
  orderId: number,
  purchaseRecordIds: number[],
): Promise<boolean> {
  const connection = await getConnection();

  try {
    const sql = `
      UPDATE orders 
      SET purchase_record_ids = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const [result] = await connection.execute<OkPacket>(sql, [
      JSON.stringify(purchaseRecordIds),
      orderId,
    ]);

    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

