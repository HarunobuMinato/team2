// ============================================
// app/api/inspections/route.ts【新規】
// 検収登録エンドポイント
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import {
  createOrUpdateInspection,
  getDeliveryInspectionStatus,
} from '@/services/inspection-service';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const deliveryId = url.searchParams.get('delivery_id');

    console.log(`📋 検収情報取得リクエスト: 納品書ID=${deliveryId}`);

    if (!deliveryId) {
      return NextResponse.json(
        { success: false, error: 'Missing delivery_id parameter' },
        { status: 400 }
      );
    }

    const { inspection, delivery } = await getDeliveryInspectionStatus(
      parseInt(deliveryId, 10)
    );

    console.log('✅ 検収情報取得成功');

    return NextResponse.json({
      success: true,
      data: {
        inspection,
        delivery,
      },
    });
  } catch (error) {
    console.error('❌ 検収情報取得エラー:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inspection' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as any;
    console.log('📨 検収登録リクエスト:', body);

    // ============================================
    // バリデーション
    // ============================================
    if (!body.delivery_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: delivery_id' },
        { status: 400 }
      );
    }

    if (!body.inspection_result) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: inspection_result' },
        { status: 400 }
      );
    }

    const validResults = ['pending', 'ok', 'ng', 'completed'];
    if (!validResults.includes(body.inspection_result)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid inspection_result. Must be one of: ${validResults.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // ============================================
    // データを整形
    // ============================================
    const inspectionData = {
      delivery_id: body.delivery_id,
      received_date: body.received_date || undefined,
      inspection_date: body.inspection_date || undefined,
      inspection_result: body.inspection_result,
      inspection_notes: body.inspection_notes || undefined,
    };

    console.log('💾 DBに保存するデータ:', inspectionData);

    // ============================================
    // DBに保存
    // ============================================
    const inspectionId = await createOrUpdateInspection(inspectionData);

    console.log(
      `✅ 検収登録成功 - ID: ${inspectionId}, 結果: ${body.inspection_result}`
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          id: inspectionId,
          delivery_id: body.delivery_id,
          inspection_result: body.inspection_result,
          message: '検収結果が保存されました',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ 検収登録エラー:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to create inspection: ${errorMessage}` },
      { status: 500 }
    );
  }
}