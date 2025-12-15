// 注文種別
export type OrderType = 'buy' | 'sell' | 'mediation';

// 買い注文ステータス
export type BuyOrderStatus = 
  | 'ordered' 
  | 'auction_processing' 
  | 'purchased' 
  | 'invoiced' 
  | 'payment_received' 
  | 'completed';

// 売り注文ステータス
export type SellOrderStatus = 
  | 'ordered' 
  | 'vehicle_received' 
  | 'auction_processing' 
  | 'sold' 
  | 'payment_notified' 
  | 'payment_completed' 
  | 'completed';

// 仲介売買ステータス
export type MediationOrderStatus = 
  | 'ordered' 
  | 'matching' 
  | 'deal_established' 
  | 'invoiced' 
  | 'payment_received' 
  | 'payment_notified' 
  | 'payment_completed' 
  | 'completed';

// 統合ステータス
export type OrderStatus = BuyOrderStatus | SellOrderStatus | MediationOrderStatus;

// 受注情報
export interface Order {
  id: string;
  orderNumber: string;
  orderType: OrderType;
  clientId: string;
  buyerClientId?: string;
  salesPersonId: string;
  status: OrderStatus;
  orderDate: Date;
  desiredDeliveryDate?: Date;
  vehiclePrice?: number;
  buyCommission: number;
  sellCommission: number;
  totalAmount?: number;
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 受注詳細（関連データを含む）
export interface OrderDetail extends Order {
  client?: {
    id: string;
    name: string;
  };
  buyerClient?: {
    id: string;
    name: string;
  };
  salesPerson?: {
    id: string;
    name: string;
  };
}

// 受注進捗履歴
export interface OrderProgress {
  id: string;
  orderId: string;
  status: OrderStatus;
  changedAt: Date;
  changedBy: string;
  notes?: string;
  createdAt: Date;
}