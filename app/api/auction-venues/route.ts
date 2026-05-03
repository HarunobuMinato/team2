import { NextRequest, NextResponse } from 'next/server';
import { getAllAuctionVenues } from '@/services/auction-venue-service';

export async function GET(request: NextRequest) {
  try {
    console.log('📨 オークション会場一覧取得リクエスト');

    const venues = await getAllAuctionVenues();

    console.log(`✅ オークション会場取得成功: ${venues.length}件`);

    return NextResponse.json({
      success: true,
      data: venues,
    });
  } catch (error) {
    console.error('❌ オークション会場取得エラー:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch auction venues' },
      { status: 500 }
    );
  }
}