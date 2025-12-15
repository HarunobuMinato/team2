/**
 * 仕入れ（オークション計算書）の型定義
 */

export interface Purchase {
  id: string;
  purchaseNumber: string; // 仕入れ番号（自動生成）
  orderId: string; // 関連する受注ID
  auctionVenueId: string; // オークション会場ID
  auctionDate: Date; // オークション日
  auctionNumber?: string; // オークション番号
  
  // 車両情報
  vehicleName: string; // 車種名
  maker?: string; // メーカー
  model?: string; // 型式
  year?: number; // 年式
  mileage?: number; // 走行距離（km）
  
  // 金額情報
  bidPrice: number; // 落札価格
  auctionFee?: number; // オークション手数料
  transportFee?: number; // 陸送費
  otherFee?: number; // その他費用
  tax?: number; // 消費税
  totalPurchaseAmount: number; // 仕入れ合計金額
  
  // オークション計算書情報
  statementReceivedDate: Date; // 計算書受領日
  paymentDueDate?: Date; // 支払期限
  paymentStatus: 'unpaid' | 'paid'; // 支払ステータス
  paidDate?: Date; // 支払日
  
  // ステータス
  status: 'draft' | 'confirmed' | 'paid' | 'completed'; // ステータス
  
  notes?: string; // 備考
  
  // システム管理
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 買い注文の詳細情報（希望条件）
 */
export interface OrderDetail {
  id: string;
  orderId: string; // 受注ID
  
  // 希望条件
  desiredMaker?: string; // 希望メーカー
  desiredModel?: string; // 希望型式
  desiredYear?: string; // 希望年式（例：2020年～2023年）
  desiredMileage?: string; // 希望走行距離（例：50000km以下）
  desiredColor?: string; // 希望色
  desiredGrade?: string; // 希望グレード
  desiredDriveType?: 'all' | '2wd' | '4wd'; // 駆動方式
  desiredFuel?: string; // 希望燃料（G/D/E等）
  
  // 装備希望
  desiredEquipment?: string[]; // 希望装備（PS/PW/CD等）
  
  // その他の条件
  acceptRepairHistory: boolean; // 修復歴有の受け入れ可否
  acceptMeterTamper: boolean; // メーター改ざん車の受け入れ可否
  acceptRental: boolean; // レンタカーの受け入れ可否
  
  // セールスポイント
  specialRequests?: string; // 特別な要望
  budgetMax?: number; // 予算上限
  
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 仕入れフォームの送信データ
 */
export interface PurchaseFormData {
  orderId: string;
  auctionVenueId: string;
  auctionDate: string;
  auctionNumber?: string;
  
  vehicleName: string;
  maker?: string;
  model?: string;
  year?: number;
  mileage?: number;
  
  bidPrice: number;
  auctionFee?: number;
  transportFee?: number;
  otherFee?: number;
  tax?: number;
  
  statementReceivedDate: string;
  paymentDueDate?: string;
  
  notes?: string;
}