// ==========================================
// オークション関連の型定義
// ==========================================

// オークション会場情報
export interface AuctionVenue {
  id: string;
  venueCode: string;
  name: string;
  address?: string;
  phone?: string;
  fax?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// オークション種別
export type AuctionType = 'purchase' | 'sale';

// オークションステータス
export type AuctionStatus = 'pending' | 'won' | 'lost' | 'sold' | 'unsold';

// オークション情報
export interface Auction {
  id: string;
  purchaseRecordId?: string; // 【新規】FK: 仕入実績ID（買い注文の場合）
  orderId: string;
  venueId: string;
  auctionDate: Date;
  auctionType: AuctionType;
  bidPrice?: number;
  auctionNumber?: string;
  status: AuctionStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// オークション計算書ステータス
export type StatementPaymentStatus = 'unpaid' | 'paid';

// オークション計算書
export interface AuctionStatement {
  id: string;
  purchaseRecordId?: string; // 【新規】FK: 仕入実績ID
  auctionId: string;
  receivedDate: Date;
  vehiclePrice: number;
  auctionFee?: number;
  transportFee?: number;
  otherFee?: number;
  tax?: number;
  totalAmount: number;
  paymentDueDate?: Date;
  paymentStatus: StatementPaymentStatus;
  paidDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}