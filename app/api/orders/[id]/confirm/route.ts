// ============================================
// app/api/orders/[id]/confirm/route.ts【新規】
// 顧客が受注確認待ちのステータスから「受注済み」へ更新
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { executeTransaction } from '@/lib/api-client';

interface ConfirmOrderRequest {
  notes?: string; // オプション：顧客のコメント
}

/**
 * 受注確認APIエンドポイント
 * GET：受注情報の取得
 * POST：顧客が受注を確認（ステータスを order_pending → ordered に更新）
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id, 10);
    const body = (await request.json()) as ConfirmOrderRequest;

    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    console.log(`📨 受注確認リクエスト: Order ID=${orderId}`);

    // トランザクション処理
    const result = await executeTransaction(async (connection) => {
      console.log('🔄 トランザクション開始');

      // 1. 現在の受注情報を取得
      console.log('📖 受注情報を取得中...');
      const [orders] = await connection.execute(
        `SELECT id, order_number, status, client_id FROM orders WHERE id = ? AND is_deleted = 0`,
        [orderId]
      );

      if (!Array.isArray(orders) || orders.length === 0) {
        throw new Error('Order not found');
      }

      const order = (orders as any)[0];

      // 2. ステータスが order_pending であることを確認
      if (order.status !== 'order_pending') {
        throw new Error(
          `Cannot confirm order with status: ${order.status}. Only order_pending status can be confirmed.`
        );
      }

      console.log(`✅ 受注情報取得完了: ${order.order_number}`);

      // 3. 受注ステータスを更新
      console.log('🔄 ステータスを更新中...');
      await connection.execute(
        `UPDATE orders 
         SET status = ?, 
             confirmed_by_client = 1, 
             confirmed_at = NOW(),
             updated_at = NOW()
         WHERE id = ?`,
        ['ordered', orderId]
      );

      console.log('✅ 受注ステータス更新完了');

      // 4. 進捗履歴を記録
      console.log('📝 進捗履歴を記録中...');

      // ここでは、顧客IDがchanged_byになります
      // 実際には、セッションからユーザーIDを取得する必要があります
      const clientId = order.client_id;

      const [maxIdResult] = await connection.execute(
        `SELECT MAX(id) as maxId FROM order_progress`
      );

      const newProgressId = ((maxIdResult as any)[0].maxId || 0) + 1;

      await connection.execute(
        `INSERT INTO order_progress 
         (id, order_id, status, changed_at, changed_by, notes, created_at)
         VALUES (?, ?, ?, NOW(), ?, ?, NOW())`,
        [
          newProgressId,
          orderId,
          'ordered',
          clientId, // 顧客が確認したため、client_idをchanged_byに設定
          body.notes || '顧客が受注を確認しました',
        ]
      );

      console.log('✅ 進捗履歴記録完了');

      return {
        orderId,
        orderNumber: order.order_number,
        newStatus: 'ordered',
        confirmedAt: new Date().toISOString(),
      };
    });

    console.log('✅ 処理完了');

    return NextResponse.json(
      {
        success: true,
        data: {
          order_id: result.orderId,
          order_number: result.orderNumber,
          status: result.newStatus,
          confirmed_at: result.confirmedAt,
          message: '受注を確認しました。ステータスが「受注済み」に更新されました。',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ エラー発生:', error);
    const errorMessage =
      error instanceof Error ? error.message : '予期しないエラーが発生しました';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}