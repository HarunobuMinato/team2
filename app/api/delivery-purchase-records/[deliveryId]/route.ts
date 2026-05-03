// ============================================
// app/api/delivery-purchase-records/[deliveryId]/route.ts【新規】
// 納品書に紐づく仕入実績取得エンドポイント
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/api-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { deliveryId: string } }
) {
  try {
    const deliveryId = parseInt(params.deliveryId, 10);
    console.log(`📨 納品書仕入実績取得リクエスト: 納品書ID=${deliveryId}`);

    if (isNaN(deliveryId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid delivery ID' },
        { status: 400 }
      );
    }

    const connection = await getConnection();

    try {
      // 納品書に紐づく仕入実績を取得
      const sql = `
        SELECT 
          pr.id,
          pr.vehicle_name,
          pr.maker,
          pr.year,
          pr.mileage,
          pr.bid_price
        FROM purchase_records pr
        INNER JOIN delivery_purchase_records dpr ON pr.id = dpr.purchase_record_id
        WHERE dpr.delivery_id = ?
      `;

      const [rows] = await connection.execute<any[]>(sql, [deliveryId]);

      console.log(`✅ 納品書仕入実績取得成功: ${rows.length}件`);

      return NextResponse.json({
        success: true,
        data: rows,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ 納品書仕入実績取得エラー:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchase records' },
      { status: 500 }
    );
  }
}