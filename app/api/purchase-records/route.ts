// ============================================
// app/api/purchase-records/route.ts【修正版】
// 仕入実績登録・取得エンドポイント
// ============================================

import {
  createPurchaseRecord,
  getPurchaseRecordsByOrder,
  getAllPurchaseRecords,
  getPurchaseRecordsWithPagination,
  searchPurchaseRecords,
  PurchaseRecordData,
} from '@/services/purchase-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('📨 仕入実績一覧取得リクエスト');

    const url = new URL(request.url);
    const orderIdParam = url.searchParams.get('order_id');
    const pageParam = url.searchParams.get('page');
    const limitParam = url.searchParams.get('limit');
    const vehicleNameParam = url.searchParams.get('vehicle_name');
    const statusParam = url.searchParams.get('status');
    const startDateParam = url.searchParams.get('start_date');
    const endDateParam = url.searchParams.get('end_date');

    // ============================================
    // パターン1: order_id 指定時（特定の受注の仕入実績）
    // ============================================
    if (orderIdParam) {
      const orderId = parseInt(orderIdParam, 10);

      if (isNaN(orderId)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid order_id: must be a number' 
          },
          { status: 400 }
        );
      }

      console.log(`🔍 order_id=${orderId} の仕入実績を取得中...`);
      const purchaseRecords = await getPurchaseRecordsByOrder(orderId);

      console.log(`✅ 仕入実績取得成功 - ${purchaseRecords.length}件`);

      return NextResponse.json({
        success: true,
        data: purchaseRecords,
        count: purchaseRecords.length,
      });
    }

    // ============================================
    // パターン2: 検索条件指定時（複数条件での絞り込み）
    // ============================================
    if (
      vehicleNameParam ||
      statusParam ||
      startDateParam ||
      endDateParam
    ) {
      console.log('🔍 仕入実績を検索中...');

      const page = pageParam ? parseInt(pageParam, 10) : 1;
      const limit = limitParam ? parseInt(limitParam, 10) : 20;

      const result = await searchPurchaseRecords({
        vehicle_name: vehicleNameParam || undefined,
        status: statusParam || undefined,
        startDate: startDateParam || undefined,
        endDate: endDateParam || undefined,
        page,
        limit,
      });

      console.log(`✅ 検索完了 - ${result.records.length}件 (全 ${result.total}件)`);

      return NextResponse.json({
        success: true,
        data: result.records,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
        count: result.records.length,
      });
    }

    // ============================================
    // パターン3: ページネーション指定時
    // ============================================
    if (pageParam || limitParam) {
      console.log('🔍 ページネーション付きで仕入実績を取得中...');

      const page = pageParam ? parseInt(pageParam, 10) : 1;
      const limit = limitParam ? parseInt(limitParam, 10) : 20;

      const result = await getPurchaseRecordsWithPagination(page, limit);

      console.log(
        `✅ 取得完了 - ${result.records.length}件 (ページ ${result.page}/${result.totalPages})`
      );

      return NextResponse.json({
        success: true,
        data: result.records,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
        count: result.records.length,
      });
    }

    // ============================================
    // パターン4: 全件取得（パラメータなし）
    // ============================================
    console.log('🔍 全ての仕入実績を取得中...');
    const allRecords = await getAllPurchaseRecords();

    console.log(`✅ 全件取得完了 - ${allRecords.length}件`);

    return NextResponse.json({
      success: true,
      data: allRecords,
      count: allRecords.length,
    });
  } catch (error) {
    console.error('❌ 仕入実績取得エラー:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to fetch purchase records: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<PurchaseRecordData>;
    console.log('📨 仕入実績登録リクエスト:', body);

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

    if (!body.vehicle_name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: vehicle_name' 
        },
        { status: 400 }
      );
    }

    if (!body.auction_date) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: auction_date' 
        },
        { status: 400 }
      );
    }

    if (body.bid_price === undefined || body.bid_price === null) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: bid_price (落札車両代金)' 
        },
        { status: 400 }
      );
    }

    // ============================================
    // データを整形
    // ============================================
    const purchaseData: PurchaseRecordData = {
      order_id: body.order_id,
      desired_vehicle_id: body.desired_vehicle_id || undefined,
      sequence_number: body.sequence_number || 1,
      vehicle_name: body.vehicle_name,
      maker: body.maker || undefined,
      model: body.model || undefined,
      year: body.year || undefined,
      mileage: body.mileage || undefined,
      inspection_date: body.inspection_date || undefined,
      color: body.color || undefined,
      body_color: body.body_color || undefined,
      transmission: body.transmission || undefined,
      engine: body.engine || undefined,
      chassis_number: body.chassis_number || undefined,
      registration_number: body.registration_number || undefined,
      auction_date: body.auction_date,
      bid_price: body.bid_price,
      bid_date: body.bid_date || undefined,
      tax_amount: body.tax_amount || 0,
      bid_fee: body.bid_fee || 0,
      status: body.status || 'recorded',
      variance_reason: body.variance_reason || undefined,
      notes: body.notes || undefined,
    };

    console.log('💾 DBに保存するデータ:', purchaseData);

    // ============================================
    // DBに保存
    // ============================================
    const recordId = await createPurchaseRecord(purchaseData);

    // ============================================
    // レスポンス計算
    // ============================================
    const totalPrice = 
      purchaseData.bid_price + 
      (purchaseData.tax_amount || 0) + 
      (purchaseData.bid_fee || 0);

    console.log(`✅ 仕入実績登録成功 - ID: ${recordId}, 合計金額: ¥${totalPrice.toLocaleString()}`);

    return NextResponse.json(
      { 
        success: true, 
        data: { 
          id: recordId,
          order_id: purchaseData.order_id,
          vehicle_name: purchaseData.vehicle_name,
          bid_price: purchaseData.bid_price,
          tax_amount: purchaseData.tax_amount,
          bid_fee: purchaseData.bid_fee,
          total_purchase_price: totalPrice,
          message: '仕入実績が登録されました'
        } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ 仕入実績登録エラー:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to create purchase record: ${errorMessage}` },
      { status: 500 }
    );
  }
}