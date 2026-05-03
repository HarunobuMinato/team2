// ============================================
// app/api/clients/[id]/route.ts
// クライアント詳細取得エンドポイント
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/api-client';

interface Client {
  id: number;
  name: string;
  client_code?: string;
  client_type?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = parseInt(params.id, 10);

    if (isNaN(clientId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid client ID' },
        { status: 400 }
      );
    }

    const connection = await getConnection();

    try {
      const sql = `
        SELECT 
          id, name, client_code, client_type, contact_person, 
          email, phone, address, notes, 
          is_deleted, created_at, updated_at
        FROM clients 
        WHERE id = ? AND is_deleted = false
      `;

      const [rows] = await connection.execute<any[]>(sql, [clientId]);

      if (rows.length === 0) {
        console.warn(`⚠️ クライアントが見つかりません: ID=${clientId}`);
        return NextResponse.json(
          { success: false, error: 'Client not found' },
          { status: 404 }
        );
      }

      const client = rows[0] as Client;

      console.log(`✅ クライアント取得成功: ID=${clientId}, Name=${client.name}`);

      return NextResponse.json({
        success: true,
        data: client,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ クライアント詳細取得エラー:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}