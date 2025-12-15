// 請求ステータス
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue';

// 請求書情報
export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  clientId: string;
  invoiceDate: Date;
  dueDate: Date;
  vehiclePrice: number;
  commission: number;
  otherFee?: number;
  tax: number;
  totalAmount: number;
  status: InvoiceStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 入金方法
export type PaymentMethod = 'bank_transfer' | 'cash' | 'other';

// 入金情報
export interface Payment {
  id: string;
  invoiceId: string;
  paymentDate: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  bankName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 支払通知ステータス
export type PaymentNoticeStatus = 'draft' | 'issued' | 'paid';

// 支払通知書
export interface PaymentNotice {
  id: string;
  noticeNumber: string;
  orderId: string;
  clientId: string;
  noticeDate: Date;
  vehiclePrice: number;
  commission: number;
  otherFee?: number;
  tax: number;
  totalAmount: number;
  status: PaymentNoticeStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 支払情報
export interface Payout {
  id: string;
  paymentNoticeId: string;
  payoutDate: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  bankName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}