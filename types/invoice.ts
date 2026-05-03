// ==========================================
// 請求・入金関連の型定義
// ==========================================

// 請求書ステータス
export type InvoiceStatus = 'draft' | 'issued' | 'partial_paid' | 'paid' | 'overdue';

// 請求タイプ
export type InvoiceType = 'single' | 'bulk';

// 請求書情報
export interface Invoice {
  id: string;
  invoiceNumber: string; // UNIQUE
  orderId?: string; // 【修正】複数受注の場合NULL（invoice_ordersテーブルで管理）
  clientId: string; // 請求先（取引先ID）
  invoiceDate: Date;
  dueDate: Date;
  totalVehiclePrice: number; // 全車両の合計代金（複数台対応）
  totalCommission: number; // 全体手数料の合計
  shipmentCost?: number; // 陸送費用（顧客負担）
  otherFee?: number; // その他費用
  tax: number; // 消費税
  totalAmount: number; // 合計金額
  status: InvoiceStatus; // ステータス
  invoiceType: InvoiceType; // 【新規】請求タイプ（単一 or 一括）
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 請求書-受注関連テーブル（複数受注対応）
export interface InvoiceOrder {
  id: string;
  invoiceId: string; // FK: 請求書ID
  orderId: string; // FK: 受注ID
  createdAt: Date;
}

// 入金方法
export type PaymentMethod = 'bank_transfer' | 'cash' | 'other';

// 入金情報
export interface Payment {
  id: string;
  invoiceId?: string; // 【修正】nullable（複数請求対応）
  clientId?: string; // 【新規】支払元の取引先ID（複数請求対応）
  paymentDate: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  bankName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 入金-請求書充当テーブル（自動引当対応）【新規】
export interface PaymentInvoiceAllocation {
  id: string;
  paymentId: string; // FK: 入金ID
  invoiceId: string; // FK: 請求書ID
  allocatedAmount: number; // 充当金額
  allocationOrder: number; // 充当順序（FIFO優先度）
  createdAt: Date;
  updatedAt: Date;
}

// 支払通知ステータス
export type PaymentNoticeStatus = 'draft' | 'issued' | 'paid';

// 支払通知書
export interface PaymentNotice {
  id: string;
  noticeNumber: string; // UNIQUE
  orderId: string; // FK: 受注ID
  clientId: string; // FK: 支払先（取引先ID）
  noticeDate: Date;
  totalVehiclePrice: number; // 【新規】全車両の合計代金
  totalCommission: number; // 【新規】全体手数料の合計（差し引き）
  otherFee?: number;
  tax: number;
  totalAmount: number; // 支払金額
  status: PaymentNoticeStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 支払情報
export interface Payout {
  id: string;
  paymentNoticeId: string; // FK: 支払通知ID
  payoutDate: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  bankName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}