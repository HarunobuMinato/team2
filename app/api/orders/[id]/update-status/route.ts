// ============================================
// app/api/orders/[id]/update-status/route.ts【新規】
// 受注ステータス更新エンドポイント
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/services/order-progress-service";

interface UpdateStatusRequest {
  status: string;
  notes?: string;
  changed_by?: number;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // ✅ params を await する
    const { id } = await params;
    const orderId = parseInt(id, 10);

    // ✅ request.json() は1回だけ呼び出す
    const body = (await request.json()) as UpdateStatusRequest;
    console.log("📨 ステータス更新リクエスト受信", body);
    console.log("📨 リクエストボディ:", body);

    if (isNaN(orderId)) {
      return Response.json({ error: "Invalid order ID" }, { status: 400 });
    }

    if (!body.status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 },
      );
    }

    console.log(
      `📨 ステータス更新リクエスト: Order ID=${orderId}, Status=${body.status}`,
    );

    // ステータスを更新
    const success = await updateOrderStatus(
      orderId,
      body.status,
      body.changed_by || 1,
      body.notes,
    );

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to update order status" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        order_id: orderId,
        status: body.status,
        message: "ステータスを更新しました",
      },
    });
  } catch (error) {
    console.error("❌ ステータス更新エラー:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order status" },
      { status: 500 },
    );
  }
}
