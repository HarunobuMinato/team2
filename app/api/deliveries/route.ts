// ============================================
// app/api/deliveries/route.ts【新規】
// 納品書登録エンドポイント
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createDelivery, getAllDeliveries, generateNextDeliveryNumber } from '@/services/delivery-service';

export async function GET(request: NextRequest) {
  try {
    console.log('📨 納品書一覧取得リクエスト');

    const url = new URL(request.url);
    const orderId = url.searchParams.get('order_id');

    // TODO: order_id に基づいて納品書を取得する場合

    const deliveries = await getAllDeliveries();

    console.log(`✅ 納品書取得成功: ${deliveries.length}件`);

    return NextResponse.json({
      success: true,
      data: deliveries,
    });
  } catch (error) {
    console.error('❌ 納品書取得エラー:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deliveries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as any;
    console.log('📨 納品書登録リクエスト:', body);

    // ============================================
    // バリデーション
    // ============================================
    if (!body.order_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: order_id' 
        },
        { status: 400 }
      );
    }

    if (!body.vehicle_count || body.vehicle_count <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing or invalid field: vehicle_count' 
        },
        { status: 400 }
      );
    }

    if (!body.delivery_date) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: delivery_date' 
        },
        { status: 400 }
      );
    }

    if (body.total_amount === undefined || body.total_amount === null) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: total_amount' 
        },
        { status: 400 }
      );
    }

    if (!body.selected_purchase_record_ids || body.selected_purchase_record_ids.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing or empty field: selected_purchase_record_ids' 
        },
        { status: 400 }
      );
    }

    // ============================================
    // 納品書番号を生成
    // ============================================
    const deliveryNumber = await generateNextDeliveryNumber();

    // ============================================
    // データを整形
    // ============================================
    const deliveryData = {
      order_id: body.order_id,
      delivery_number: deliveryNumber,
      vehicle_count: body.vehicle_count,
      delivery_date: body.delivery_date,
      delivery_location: body.delivery_location || undefined,
      total_amount: body.total_amount,
      notes: body.notes || undefined,
      status: body.status || 'issued',
    };

    console.log('💾 DBに保存するデータ:', deliveryData);

    // ============================================
    // DBに保存
    // ============================================
    const deliveryId = await createDelivery(
      deliveryData,
      body.selected_purchase_record_ids
    );

    console.log(
      `✅ 納品書登録成功 - ID: ${deliveryId}, 納品書番号: ${deliveryNumber}, 台数: ${body.vehicle_count}`
    );

    return NextResponse.json(
      { 
        success: true, 
        data: { 
          id: deliveryId,
          delivery_number: deliveryNumber,
          vehicle_count: body.vehicle_count,
          total_amount: body.total_amount,
          message: '納品書が登録されました'
        } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ 納品書登録エラー:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to create delivery: ${errorMessage}` },
      { status: 500 }
    );
  }
}