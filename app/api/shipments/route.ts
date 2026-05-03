// ============================================
// app/api/shipments/route.ts【新規】
// 出荷登録エンドポイント
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createShipment, getAllShipments, generateNextShipmentNumber } from '@/services/shipment-service';
import { getPurchaseRecordsByOrder } from '@/services/purchase-service';

export async function GET(request: NextRequest) {
  try {
    console.log('📨 出荷一覧取得リクエスト');

    const url = new URL(request.url);
    const orderId = url.searchParams.get('order_id');
    console.log('🔍 クエリパラメータ order_id:', orderId);

    // TODO: order_id に基づいて出荷を取得する場合

    const shipments = await getAllShipments(orderId ? parseInt(orderId) : null);

    console.log(`✅ 出荷取得成功: ${shipments.length}件`);

    return NextResponse.json({
      success: true,
      data: shipments,
    });
  } catch (error) {
    console.error('❌ 出荷取得エラー:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as any;
    console.log('📨 出荷登録リクエスト:', body);

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

    if (!body.shipment_date) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: shipment_date' 
        },
        { status: 400 }
      );
    }

    if (!body.transport_company_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: transport_company_id' 
        },
        { status: 400 }
      );
    }

    if (body.transport_cost === undefined || body.transport_cost === null) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: transport_cost' 
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
    // 出荷番号を生成
    // ============================================
    const shipmentNumber = await generateNextShipmentNumber();

    // ============================================
    // データを整形
    // ============================================
    const shipmentData = {
      order_id: body.order_id,
      shipment_number: shipmentNumber,
      vehicle_count: body.vehicle_count,
      shipment_date: body.shipment_date,
      pickup_date: body.pickup_date || undefined,
      delivery_date: body.delivery_date || undefined,
      transport_company_id: body.transport_company_id,
      transport_cost: body.transport_cost,
      transport_notes: body.transport_notes || undefined,
      status: body.status || 'confirmed',
    };

    console.log('💾 DBに保存するデータ:', shipmentData);

    // ============================================
    // DBに保存
    // ============================================
    const shipmentId = await createShipment(
      shipmentData,
      body.selected_purchase_record_ids
    );

    console.log(
      `✅ 出荷登録成功 - ID: ${shipmentId}, 出荷番号: ${shipmentNumber}, 台数: ${body.vehicle_count}`
    );

    return NextResponse.json(
      { 
        success: true, 
        data: { 
          id: shipmentId,
          shipment_number: shipmentNumber,
          vehicle_count: body.vehicle_count,
          transport_cost: body.transport_cost,
          message: '出荷が登録されました'
        } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ 出荷登録エラー:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to create shipment: ${errorMessage}` },
      { status: 500 }
    );
  }
}