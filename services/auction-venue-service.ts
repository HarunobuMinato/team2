// ============================================
// services/auction-venue-service.ts【新規】
// オークション会場管理サービス
// ============================================

import { getConnection } from '@/lib/api-client';
import { RowDataPacket } from 'mysql2';

export interface AuctionVenue extends RowDataPacket {
  id: number;
  venue_code: string;
  name: string;
  address?: string;
  phone?: string;
  fax?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * すべてのオークション会場を取得
 */
export async function getAllAuctionVenues(): Promise<AuctionVenue[]> {
  const connection = await getConnection();

  try {
    const sql = `
      SELECT id, venue_code, name, address, phone, fax, is_active, created_at, updated_at
      FROM auction_venues
      WHERE is_active = true
      ORDER BY name
    `;

    const [rows] = await connection.execute<AuctionVenue[]>(sql);
    return rows || [];
  } finally {
    connection.release();
  }
}

/**
 * IDでオークション会場を取得
 */
export async function getAuctionVenueById(
  venueId: number
): Promise<AuctionVenue | null> {
  const connection = await getConnection();

  try {
    const sql = `
      SELECT id, venue_code, name, address, phone, fax, is_active, created_at, updated_at
      FROM auction_venues
      WHERE id = ? AND is_active = true
    `;

    const [rows] = await connection.execute<AuctionVenue[]>(sql, [venueId]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    connection.release();
  }
}

/**
 * 会場コードでオークション会場を取得
 */
export async function getAuctionVenueByCode(
  venueCode: string
): Promise<AuctionVenue | null> {
  const connection = await getConnection();

  try {
    const sql = `
      SELECT id, venue_code, name, address, phone, fax, is_active, created_at, updated_at
      FROM auction_venues
      WHERE venue_code = ? AND is_active = true
    `;

    const [rows] = await connection.execute<AuctionVenue[]>(sql, [venueCode]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    connection.release();
  }
}