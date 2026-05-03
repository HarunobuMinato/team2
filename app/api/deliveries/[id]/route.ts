// ============================================
// app/api/deliveries/[id]/route.ts【新規】
// 納品書詳細取得エンドポイント
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getDelivery } from '@/services/delivery-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deliveryId = parseInt(params.id, 10);
    console.log(`📨 納品書詳細取得リクエスト: ID=${deliveryId}`);

    if (isNaN(deliveryId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid delivery ID' },
        { status: 400 }
      );
    }

    const delivery = await getDelivery(deliveryId);

    if (!delivery) {
      return NextResponse.json(
        { success: false, error: 'Delivery not found' },
        { status: 404 }
      );
    }

    console.log(`✅ 納品書詳細取得成功: ${delivery.delivery_number}`);

    return NextResponse.json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    console.error('❌ 納品書詳細取得エラー:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch delivery' },
      { status: 500 }
    );
  }
}