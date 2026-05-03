// ============================================
// 4. services/desired-vehicle-service.ts【新規】
// ============================================

import { OkPacket, RowDataPacket } from 'mysql2';
import { getConnection } from '@/lib/api-client';

export interface DesiredVehicleData {
  order_id: number;
  sequence_number: number;
  vehicle_name: string;
  maker?: string | null;
  model?: string | null;
  desired_year_from?: number | null;
  desired_year_to?: number | null;
  desired_mileage_max?: number | null;
  inspection_date_min?: string | null;
  color?: string | null;
  notes?: string | null;
}

/**
 * 希望車両を作成（connection オプション対応）
 */
export async function createDesiredVehicle(
  data: DesiredVehicleData,
  connection?: any
): Promise<number> {
  const conn = connection || (await getConnection());

  try {
    const sql = `
      INSERT INTO desired_vehicles (
        order_id, sequence_number, vehicle_name,
        maker, model, desired_year_from, desired_year_to,
        desired_mileage_max, inspection_date_min, color, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await conn.execute(sql, [
      data.order_id,
      data.sequence_number,
      data.vehicle_name,
      data.maker || null,
      data.model || null,
      data.desired_year_from || null,
      data.desired_year_to || null,
      data.desired_mileage_max || null,
      data.inspection_date_min || null,
      data.color || null,
      data.notes || null,
    ]);

    return result.insertId as number;
  } finally {
    if (!connection) {
      conn.release();
    }
  }
}

/**
 * 希望車両を取得
 */
export async function getDesiredVehicle(vehicleId: number) {
  const connection = await getConnection();

  try {
    const sql =
      'SELECT * FROM desired_vehicles WHERE id = ? AND is_deleted = false';
    const [rows] = await connection.execute<any[]>(sql, [vehicleId]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    connection.release();
  }
}

/**
 * 受注の希望車両一覧を取得
 */
export async function getDesiredVehiclesByOrder(orderId: number) {
  const connection = await getConnection();

  try {
    const sql = `
      SELECT * FROM desired_vehicles 
      WHERE order_id = ? AND is_deleted = false
      ORDER BY sequence_number ASC
    `;
    const [rows] = await connection.execute<any[]>(sql, [orderId]);
    return rows;
  } finally {
    connection.release();
  }
}

/**
 * 希望車両を更新
 */
export async function updateDesiredVehicle(
  vehicleId: number,
  data: Partial<DesiredVehicleData>
) {
  const connection = await getConnection();

  try {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.vehicle_name) {
      updates.push('vehicle_name = ?');
      params.push(data.vehicle_name);
    }
    if (data.maker !== undefined) {
      updates.push('maker = ?');
      params.push(data.maker);
    }
    if (data.model !== undefined) {
      updates.push('model = ?');
      params.push(data.model);
    }
    if (data.desired_year_from !== undefined) {
      updates.push('desired_year_from = ?');
      params.push(data.desired_year_from);
    }
    if (data.desired_year_to !== undefined) {
      updates.push('desired_year_to = ?');
      params.push(data.desired_year_to);
    }
    if (data.desired_mileage_max !== undefined) {
      updates.push('desired_mileage_max = ?');
      params.push(data.desired_mileage_max);
    }
    if (data.color !== undefined) {
      updates.push('color = ?');
      params.push(data.color);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      params.push(data.notes);
    }

    if (updates.length === 0) return false;

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(vehicleId);

    const sql = `
      UPDATE desired_vehicles SET ${updates.join(', ')} WHERE id = ?
    `;

    const [result] = await connection.execute<OkPacket>(sql, params);
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}
