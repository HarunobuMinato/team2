// ============================================
// 1. app/api/clients/route.ts【新規】
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/api-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'customer' or 'vendor'

    const connection = await getConnection();

    let sql =
      'SELECT id, name, client_code, contact_person FROM clients WHERE is_deleted = false';
    const params: any[] = [];

    if (type) {
      sql += ' AND client_type = ?';
      params.push(type);
    }

    sql += ' ORDER BY name';

    const [rows] = await connection.execute(sql, params);
    connection.release();

    return NextResponse.json({
      success: true,
      data: rows || [],
    });
  } catch (error) {
    console.error('GET /api/clients:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}