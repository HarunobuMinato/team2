// ============================================
// app/api/auction-venues/[id]/route.ts【新規】
// オークション会場詳細取得エンドポイント
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAuctionVenueById } from '@/services/auction-venue-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = parseInt(params.id, 10);

    if (isNaN(venueId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid venue ID' },
        { status: 400 }
      );
    }

    console.log(`📨 オークション会場詳細取得リクエスト: ID=${venueId}`);

    const venue = await getAuctionVenueById(venueId);

    if (!venue) {
      console.warn(`⚠️ オークション会場が見つかりません: ID=${venueId}`);
      return NextResponse.json(
        { success: false, error: 'Auction venue not found' },
        { status: 404 }
      );
    }

    console.log(`✅ オークション会場取得成功: ID=${venueId}, Name=${venue.name}`);

    return NextResponse.json({
      success: true,
      data: venue,
    });
  } catch (error) {
    console.error('❌ オークション会場詳細取得エラー:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch auction venue' },
      { status: 500 }
    );
  }
}