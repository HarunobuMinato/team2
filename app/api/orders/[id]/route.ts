// ============================================
// app/api/orders/[id]/route.ts【修正版】
// ============================================

import { getOrder, updateOrder } from '@/services/order-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);
    const order = await getOrder(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error(`GET /api/orders/[id]:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);
    const body = await request.json();

    // 管理者のユーザーID（フロントエンドから渡される）
    const changedByUserId = body.changed_by || 1;

    const success = await updateOrder(
      orderId,
      {
        status: body.status,
        notes: body.notes,
      },
      changedByUserId
    );

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: orderId, message: '受注が更新されました' },
    });
  } catch (error) {
    console.error(`PUT /api/orders/[id]:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}