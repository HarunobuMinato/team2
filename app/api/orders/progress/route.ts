// ============================================
// app/api/orders/[id]/progress/route.ts【新規】
// 受注の進捗履歴を取得
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/api-client';

interface OrderProgress {
  id: number;
  order_id: number;
  status: string;
  changed_at: string;
  changed_by: number;
  notes: string | null;
  created_at: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id, 10);

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
          id, order_id, status, changed_at, changed_by, notes, created_at
        FROM order_progress 
        WHERE order_id = ? 
        ORDER BY changed_at ASC
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
    console.error('Failed to fetch order progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order progress' },
      { status: 500 }
    );
  }
}