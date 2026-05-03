import { getConnection, executeTransaction } from '@/lib/api-client';
import { RowDataPacket, OkPacket } from 'mysql2';
import { determineInvoiceStatus } from '@/lib/utils/calculations';

export interface InvoiceData {
  invoice_number: string;
  client_id: number;
  order_id?: number;
  delivery_ids: number[];
  invoice_date: string;
  due_date: string;
  total_vehicle_price: number;
  total_commission: number;
  shipment_cost?: number;
  other_fee?: number;
  tax: number;
  total_amount: number;
  status?: string;
  invoice_type?: string;
  notes?: string;
}

export interface InvoiceResponse extends RowDataPacket {
  id: number;
  invoice_number: string;
  client_id: number;
  order_id: number | null;
  is_multi_order: boolean;
  delivery_ids: string;  // JSON文字列
  invoice_date: string;
  due_date: string;
  total_vehicle_price: number;
  total_commission: number;
  shipment_cost: number | null;
  other_fee: number | null;
  tax: number;
  total_amount: number;
  paid_amount: number;
  status: string;
  invoice_type: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * 請求書を作成
 */
export async function createInvoice(data: InvoiceData): Promise<number> {
  return await executeTransaction(async (connection) => {
    const isMultiOrder = !data.order_id;

    const sql = `
      INSERT INTO invoices (
        invoice_number, client_id, order_id, is_multi_order, delivery_ids,
        invoice_date, due_date,
        total_vehicle_price, total_commission, shipment_cost, other_fee, tax,
        total_amount, paid_amount, status, invoice_type, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute<OkPacket>(sql, [
      data.invoice_number,
      data.client_id,
      data.order_id || null,
      isMultiOrder ? 1 : 0,
      JSON.stringify(data.delivery_ids),
      data.invoice_date,
      data.due_date,
      data.total_vehicle_price,
      data.total_commission,
      data.shipment_cost || null,
      data.other_fee || null,
      data.tax,
      data.total_amount,
      0,  // paid_amount 初期値
      data.status || 'draft',
      data.invoice_type || 'single',
      data.notes || null,
    ]);

    return result.insertId;
  });
}

/**
 * 請求書を取得
 */
export async function getInvoice(invoiceId: number): Promise<InvoiceResponse | null> {
  const connection = await getConnection();

  try {
    const sql = 'SELECT * FROM invoices WHERE id = ?';
    const [rows] = await connection.execute<InvoiceResponse[]>(sql, [invoiceId]);

    if (rows.length === 0) return null;

    const invoice = rows[0];
    // ステータスを自動判定
    invoice.status = determineInvoiceStatus(
      invoice.total_amount,
      invoice.paid_amount,
      invoice.due_date
    );

    return invoice;
  } finally {
    connection.release();
  }
}

/**
 * 請求書一覧を取得
 */
export async function getInvoices(
  clientId?: number,
  status?: string,
  limit: number = 20,
  offset: number = 0
): Promise<InvoiceResponse[]> {
  const connection = await getConnection();

  try {
    let sql = 'SELECT * FROM invoices WHERE 1=1';
    const params: any[] = [];

    if (clientId) {
      sql += ' AND client_id = ?';
      params.push(clientId);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await connection.execute<InvoiceResponse[]>(sql, params);

    // 各請求書のステータスを自動判定
    return rows.map((invoice) => ({
      ...invoice,
      status: determineInvoiceStatus(
        invoice.total_amount,
        invoice.paid_amount,
        invoice.due_date
      ),
    }));
  } finally {
    connection.release();
  }
}

/**
 * 請求書を更新
 */
export async function updateInvoice(
  invoiceId: number,
  data: Partial<InvoiceData>
): Promise<boolean> {
  const connection = await getConnection();

  try {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.status) {
      updates.push('status = ?');
      params.push(data.status);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      params.push(data.notes);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(invoiceId);

    const sql = `
      UPDATE invoices SET ${updates.join(', ')} WHERE id = ?
    `;

    const [result] = await connection.execute<OkPacket>(sql, params);
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

/**
 * 支払済み金額を更新
 */
export async function updatePaidAmount(
  invoiceId: number,
  paidAmount: number
): Promise<boolean> {
  const connection = await getConnection();

  try {
    const sql = `
      UPDATE invoices 
      SET paid_amount = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const [result] = await connection.execute<OkPacket>(sql, [paidAmount, invoiceId]);
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}