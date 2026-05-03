import { NextRequest, NextResponse } from 'next/server';
import {
  allocatePaymentToInvoices,
  getAllocations,
} from '@/services/payment-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment_id, client_id } = body;

    if (!payment_id || !client_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 自動配分を実行
    const allocations = await allocatePaymentToInvoices(payment_id, client_id);

    // 配分詳細を取得
    const allocationDetails = await getAllocations(payment_id);

    return NextResponse.json({
      success: true,
      data: {
        payment_id,
        allocations: allocationDetails,
        total_allocated: allocations.reduce((sum, a) => sum + a.allocated_amount, 0),
      },
    });
  } catch (error) {
    console.error('POST /api/payments/allocate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to allocate payment' },
      { status: 500 }
    );
  }
}