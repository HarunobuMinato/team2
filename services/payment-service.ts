import { getConnection, executeTransaction } from '@/lib/api-client';
import { RowDataPacket, OkPacket } from 'mysql2';
import { updatePaidAmount } from './invoice-service';

export interface PaymentData {
  client_id: number;
  payment_date: string;
  amount: number;
  payment_method: string;
  notes?: string;
}

export interface PaymentResponse extends RowDataPacket {
  id: number;
  client_id: number;
  payment_date: string;
  amount: number;
  payment_method: string;
  is_allocated: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AllocationData {
  payment_id: number;
  invoice_id: number;
  allocated_amount: number;
  allocation_order: number;
}

/**
 * 入金を作成
 */
export async function createPayment(data: PaymentData): Promise<number> {
  const connection = await getConnection();

  try {
    const sql = `
      INSERT INTO payments (
        client_id, payment_date, amount, payment_method, is_allocated, notes
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute<OkPacket>(sql, [
      data.client_id,
      data.payment_date,
      data.amount,
      data.payment_method || 'bank_transfer',
      false,  // 最初は配分未済
      data.notes || null,
    ]);

    return result.insertId;
  } finally {
    connection.release();
  }
}

/**
 * 入金を取得
 */
export async function getPayment(paymentId: number): Promise<PaymentResponse | null> {
  const connection = await getConnection();

  try {
    const sql = 'SELECT * FROM payments WHERE id = ?';
    const [rows] = await connection.execute<PaymentResponse[]>(sql, [paymentId]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    connection.release();
  }
}

/**
 * 入金一覧を取得
 */
export async function getPayments(
  clientId?: number,
  limit: number = 20,
  offset: number = 0
): Promise<PaymentResponse[]> {
  const connection = await getConnection();

  try {
    let sql = 'SELECT * FROM payments WHERE 1=1';
    const params: any[] = [];

    if (clientId) {
      sql += ' AND client_id = ?';
      params.push(clientId);
    }

    sql += ' ORDER BY payment_date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await connection.execute<PaymentResponse[]>(sql, params);
    return rows;
  } finally {
    connection.release();
  }
}

/**
 * 複数請求書への自動配分を実行
 * FIFO（先入れ先出し）アルゴリズム
 */
export async function allocatePaymentToInvoices(
  paymentId: number,
  clientId: number
): Promise<AllocationData[]> {
  return await executeTransaction(async (connection) => {
    // 1. 入金情報を取得
    const [payments] = await connection.execute<any[]>(
      'SELECT * FROM payments WHERE id = ?',
      [paymentId]
    );

    if (payments.length === 0) throw new Error('Payment not found');

    const payment = payments[0];
    let remainingAmount = payment.amount;
    const allocations: AllocationData[] = [];
    let allocationOrder = 1;

    // 2. 未払いの請求書を期日の古い順に取得（FIFO）
    const [invoices] = await connection.execute<any[]>(
      `SELECT * FROM invoices 
       WHERE client_id = ? AND (status = 'issued' OR status = 'partial_paid')
       ORDER BY due_date ASC, created_at ASC`,
      [clientId]
    );

    // 3. 各請求書に配分
    for (const invoice of invoices) {
      if (remainingAmount <= 0) break;

      const remaining = invoice.total_amount - invoice.paid_amount;
      if (remaining <= 0) continue;

      const allocatedAmount = Math.min(remainingAmount, remaining);

      // 配分テーブルに挿入
      await connection.execute<OkPacket>(
        `INSERT INTO payment_invoice_allocations 
         (payment_id, invoice_id, allocated_amount, allocation_order)
         VALUES (?, ?, ?, ?)`,
        [paymentId, invoice.id, allocatedAmount, allocationOrder]
      );

      // 請求書の支払済み金額を更新
      const newPaidAmount = invoice.paid_amount + allocatedAmount;
      await connection.execute<OkPacket>(
        'UPDATE invoices SET paid_amount = ? WHERE id = ?',
        [newPaidAmount, invoice.id]
      );

      allocations.push({
        payment_id: paymentId,
        invoice_id: invoice.id,
        allocated_amount: allocatedAmount,
        allocation_order: allocationOrder,
      });

      remainingAmount -= allocatedAmount;
      allocationOrder++;
    }

    // 4. 入金の配分済みフラグを更新
    await connection.execute<OkPacket>(
      'UPDATE payments SET is_allocated = ? WHERE id = ?',
      [true, paymentId]
    );

    return allocations;
  });
}

/**
 * 配分情報を取得
 */
export async function getAllocations(
  paymentId: number
): Promise<AllocationData[]> {
  const connection = await getConnection();

  try {
    const sql = `
      SELECT * FROM payment_invoice_allocations
      WHERE payment_id = ?
      ORDER BY allocation_order ASC
    `;

    const [rows] = await connection.execute<AllocationData[]>(sql, [paymentId]);
    return rows;
  } finally {
    connection.release();
  }
}