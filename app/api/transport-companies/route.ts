// ============================================
// app/api/transport-companies/route.ts【新規】
// 陸送業者一覧取得エンドポイント
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/api-client';

export async function GET(request: NextRequest) {
  try {
    console.log('📨 陸送業者一覧取得リクエスト');

    const connection = await getConnection();

    try {
      const sql = `
        SELECT id, code, name, address, phone, fax, is_active
        FROM transport_companies
        WHERE is_active = true
        ORDER BY name
      `;

      const [rows] = await connection.execute<any[]>(sql);

      console.log(`✅ 陸送業者取得成功: ${rows.length}件`);

      return NextResponse.json({
        success: true,
        data: rows,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ 陸送業者取得エラー:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transport companies' },
      { status: 500 }
    );
  }
}