// ============================================
// app/api/auth/login/route.ts【新規】
// シンプルなログイン認証
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/api-client';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  data?: {
    id: number;
    email: string;
    name: string;
    role: string;
    client_id?: number;
  };
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<LoginResponse>> {
  try {
    const body = (await request.json()) as LoginRequest;

    // バリデーション
    if (!body.email || !body.password) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          error: 'メールアドレスとパスワードが必須です',
        },
        { status: 400 }
      );
    }

    const connection = await getConnection();

    try {
      // ユーザーを検索
      const sql = `
        SELECT id, email, name, role, password_hash, is_active, client_id
        FROM users 
        WHERE email = ?
      `;

      const [rows] = await connection.execute<any[]>(sql, [body.email]);

      if (rows.length === 0) {
        console.warn(`❌ ログイン失敗: ユーザーが見つかりません (${body.email})`);
        return NextResponse.json<LoginResponse>(
          {
            success: false,
            error: 'メールアドレスまたはパスワードが正しくありません',
          },
          { status: 401 }
        );
      }

      const user = rows[0];

      // ユーザーが非アクティブか確認
      if (!user.is_active) {
        console.warn(`❌ ログイン失敗: ユーザーが非アクティブ (${body.email})`);
        return NextResponse.json<LoginResponse>(
          {
            success: false,
            error: 'このアカウントは無効です',
          },
          { status: 401 }
        );
      }

      // パスワードを検証

      if (user.password_hash !== body.password) {
        console.warn(`❌ ログイン失敗: パスワード不正 (${body.email})`);
        return NextResponse.json<LoginResponse>(
          {
            success: false,
            error: 'メールアドレスまたはパスワードが正しくありません',
          },
          { status: 401 }
        );
      }

      // ログイン成功
      console.log(`✅ ログイン成功: ${user.email} (${user.name}) - role: ${user.client_id}`);

      return NextResponse.json<LoginResponse>(
        {
          success: true,
          data: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            client_id: user.client_id,
          },
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ ログイン処理エラー:', error);
    return NextResponse.json<LoginResponse>(
      {
        success: false,
        error: 'ログインに失敗しました',
      },
      { status: 500 }
    );
  }
}