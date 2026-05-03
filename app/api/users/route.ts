// ============================================
// 2. app/api/users/route.ts【新規】
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/api-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role'); // 'sales', 'admin', etc.

    const connection = await getConnection();

    let sql =
      'SELECT id, name, email, role FROM users WHERE is_active = true';
    const params: any[] = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    sql += ' ORDER BY name';

    const [rows] = await connection.execute(sql, params);
    connection.release();

    return NextResponse.json({
      success: true,
      data: rows || [],
    });
  } catch (error) {
    console.error('GET /api/users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}