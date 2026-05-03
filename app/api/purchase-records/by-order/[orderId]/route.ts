// ============================================
// app/api/purchase-records/by-order/[orderId]/route.ts【新規】
// 受注に紐づく仕入実績を取得
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/api-client';

interface PurchaseRecord {
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
  created_at: string;
  updated_at: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = parseInt(params.orderId, 10);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const connection = await getConnection();

    try {
      const sql = `
        SELECT 
          id, order_id, sequence_number,
          vehicle_name, maker, model, year, mileage, color,
          body_color, transmission, engine,
          auction_date, bid_price, bid_date,
          tax_amount, bid_fee, total_purchase_price,
          status, created_at, updated_at
        FROM purchase_records 
        WHERE order_id = ? AND is_deleted = false
        ORDER BY sequence_number ASC
      `;

      const [rows] = await connection.execute(sql, [orderId]);

      return NextResponse.json({
        success: true,
        data: rows || [],
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to fetch purchase records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchase records' },
      { status: 500 }
    );
  }
}
