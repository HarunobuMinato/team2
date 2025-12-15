// 納品書型定義（Delivery）

export interface Delivery {
  id: string;
  deliveryNumber: string;
  
  // 関連情報
  orderId?: string;           // 受注ID（レガシー対応）
  purchaseId?: string;        // 仕入れID（新規）
  clientId?: string;          // 顧客ID（レガシー対応）
  
  // 納品情報
  deliveryDate: Date | string;
  deliveryLocation: string;
  
  // 金額情報（レガシー対応）
  vehiclePrice: number;
  commission: number;
  otherFee?: number;
  tax: number;
  totalAmount: number;
  
  // メタ情報
  status: 'draft' | 'issued' | 'sent' | 'received';
  notes?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  isDeleted?: boolean;
}

// ステータスラベル
export const DELIVERY_STATUS_LABELS: Record<string, string> = {
  draft: '下書き',
  issued: '発行済み',
  sent: '送信済み',
  received: '受領済み',
};

// ステータスカラー
export const DELIVERY_STATUS_COLORS: Record<string, string> = {
  draft: 'gray',
  issued: 'blue',
  sent: 'yellow',
  received: 'green',
};