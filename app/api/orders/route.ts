// ============================================
// app/api/orders/route.ts【修正版】
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import {
  createOrder,
  getOrders,
  OrderData,
} from '@/services/order-service';
import { calculateOffset } from '@/lib/api-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get('client_id');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const offset = calculateOffset(page, limit);

    const orders = await getOrders(
      clientId ? parseInt(clientId) : undefined,
      status || undefined,
      limit,
      offset
    );

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('GET /api/orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<OrderData>;

    // バリデーション
    if (!body.order_number || !body.client_id || !body.sales_person_id || !body.order_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: order_number, client_id, sales_person_id, order_date' },
        { status: 400 }
      );
    }

    const orderData: OrderData = {
      order_number: body.order_number,
      order_type: body.order_type || 'buy',
      client_id: body.client_id,
      sales_person_id: body.sales_person_id,
      order_date: body.order_date,
      desired_delivery_date: body.desired_delivery_date,
      vehicle_count: body.vehicle_count || 0,
      notes: body.notes,
    };

    const orderId = await createOrder(orderData);

    return NextResponse.json(
      { 
        success: true, 
        data: { 
          id: orderId,
          message: '受注確認待ちで登録されました。顧客の確認をお待ちください。'
        } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}