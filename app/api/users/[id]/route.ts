// ============================================
// app/api/users/[id]/route.ts
// ユーザー詳細取得エンドポイント
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/api-client';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id, 10);

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const connection = await getConnection();

    try {
      const sql = `
        SELECT 
          id, email, name, role, is_active, created_at, updated_at
        FROM users 
        WHERE id = ? AND is_active = true
      `;

      const [rows] = await connection.execute<any[]>(sql, [userId]);

      if (rows.length === 0) {
        console.warn(`⚠️ ユーザーが見つかりません: ID=${userId}`);
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      const user = rows[0] as User;

      console.log(`✅ ユーザー取得成功: ID=${userId}, Name=${user.name}, Role=${user.role}`);

      return NextResponse.json({
        success: true,
        data: user,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ ユーザー詳細取得エラー:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}