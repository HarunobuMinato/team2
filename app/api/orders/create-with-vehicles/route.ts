// ============================================
// app/api/orders/create-with-vehicles/route.ts【修正版】
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { executeTransaction } from "@/lib/api-client";
import { createOrder } from "@/services/order-service";
import { createDesiredVehicle } from "@/services/desired-vehicle-service";

/**
 * フロントエンドから送信される希望車両データ
 * フォームの camelCase をそのまま受け取る
 */
interface DesiredVehicleInput {
  sequence_number: number;
  vehicle_name: string; // 【修正】vehicleName → vehicle_name
  maker?: string | null;
  model?: string | null;
  desired_year_from?: number | null; // 【修正】desiredYearFrom → desired_year_from
  desired_year_to?: number | null; // 【修正】desiredYearTo → desired_year_to
  desired_mileage_max?: number | null; // 【修正】desiredMileageMax → desired_mileage_max
  inspection_date_min?: string | null; // 【修正】inspectionDateMin → inspection_date_min
  color?: string | null;
  notes?: string | null;
}

/**
 * リクエストボディ（フロントエンドから送信）
 */
interface CreateOrderWithVehiclesRequest {
  order_number: string;
  order_type: string;
  client_id: number;
  sales_person_id: string | number;
  order_date: string;
  desired_delivery_date?: string | null;
  vehicle_count: number;
  notes?: string | null;
  desired_vehicles: DesiredVehicleInput[]; // 【修正】正しいインターフェースを使用
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateOrderWithVehiclesRequest;

    console.log("📨 リクエストボディ:", JSON.stringify(body, null, 2));

    // バリデーション
    if (
      !body.order_number ||
      !body.client_id ||
      !body.sales_person_id ||
      !body.order_date
    ) {
      console.error("❌ バリデーションエラー: 必須フィールドが不足");
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: order_number, client_id, sales_person_id, order_date",
        },
        { status: 400 },
      );
    }

    if (!body.desired_vehicles || body.desired_vehicles.length === 0) {
      console.error("❌ バリデーションエラー: 希望車両が必須");
      return NextResponse.json(
        { success: false, error: "At least one desired vehicle is required" },
        { status: 400 },
      );
    }

    // sales_person_id を数値に変換
    const salesPersonId =
      typeof body.sales_person_id === "string"
        ? parseInt(body.sales_person_id, 10)
        : body.sales_person_id;

    if (isNaN(salesPersonId)) {
      return NextResponse.json(
        { success: false, error: "Invalid sales_person_id format" },
        { status: 400 },
      );
    }

    console.log("✅ バリデーション完了");

    // トランザクション処理
    const result = await executeTransaction(async (connection) => {
      console.log("🔄 トランザクション開始");

      // 1. 受注を作成
      console.log("📝 受注を作成中...");
      const orderId = await createOrder(
        {
          order_number: body.order_number,
          order_type: body.order_type as "buy" | "sell" | "mediation",
          client_id: body.client_id,
          sales_person_id: salesPersonId,
          order_date: body.order_date,
          desired_delivery_date: body.desired_delivery_date || undefined,
          vehicle_count: body.vehicle_count,
          notes: body.notes || undefined,
        },
        connection,
      );

      console.log(`✅ 受注作成完了: ID=${orderId}`);

      // 2. 希望車両を作成
      console.log(`📝 希望車両を作成中... (${body.desired_vehicles.length}台)`);
      const vehicleIds = [];

      for (let i = 0; i < body.desired_vehicles.length; i++) {
        const vehicle = body.desired_vehicles[i];

        console.log(`  - 希望車両 ${i + 1}: ${vehicle.vehicle_name} を作成中...`);

        const vehicleId = await createDesiredVehicle(
          {
            order_id: orderId,
            sequence_number: vehicle.sequence_number,
            vehicle_name: vehicle.vehicle_name, // 【修正】vehicleName → vehicle_name
            maker: vehicle.maker || null,
            model: vehicle.model || null,
            desired_year_from: vehicle.desired_year_from || null, // 【修正】
            desired_year_to: vehicle.desired_year_to || null, // 【修正】
            desired_mileage_max: vehicle.desired_mileage_max || null, // 【修正】
            inspection_date_min: vehicle.inspection_date_min || null, // 【修正】
            color: vehicle.color || null,
            notes: vehicle.notes || null,
          },
          connection,
        );
        vehicleIds.push(vehicleId);
        console.log(`    ✅ 希望車両作成完了: ID=${vehicleId}`);
      }

      console.log("🎉 トランザクション成功");

      return {
        orderId,
        vehicleIds,
      };
    });

    console.log("✅ 処理完了");

    return NextResponse.json(
      {
        success: true,
        data: {
          order_id: result.orderId,
          order_number: body.order_number,
          vehicle_count: body.desired_vehicles.length,
          message: `受注と${body.desired_vehicles.length}台の希望車両を登録しました`,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("❌ エラー発生:", error);
    const errorMessage =
      error instanceof Error ? error.message : "予期しないエラーが発生しました";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
