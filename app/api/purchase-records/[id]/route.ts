// ============================================
// app/api/purchase-records/[id]/route.ts【修正版】
// ============================================

import { 
  getPurchaseRecord, 
  updatePurchaseRecord 
} from '@/services/purchase-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordId = parseInt(params.id);
    const record = await getPurchaseRecord(recordId);

    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Purchase record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error(`GET /api/purchase-records/[id]:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchase record' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordId = parseInt(params.id);
    const body = await request.json();

    const success = await updatePurchaseRecord(recordId, {
      status: body.status,
      body_color: body.body_color,
      transmission: body.transmission,
      engine: body.engine,
      tax_amount: body.tax_amount, // 【新規】自動車税更新
      bid_fee: body.bid_fee, // 【新規】落札料更新
      bid_price: body.bid_price, // bid_price 更新も可能
      notes: body.notes,
    });

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Purchase record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: recordId, message: '仕入実績が更新されました' },
    });
  } catch (error) {
    console.error(`PUT /api/purchase-records/[id]:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to update purchase record' },
      { status: 500 }
    );
  }
}