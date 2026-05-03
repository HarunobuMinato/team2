// ==========================================
// 受注（Order）の型定義
// 複数車両対応、新ステータス対応
// ==========================================

// 注文種別
export type OrderType = 'buy' | 'sell' | 'mediation';

// 買い注文ステータス【更新】
export type BuyOrderStatus =
  | 'order_pending' // 【新規】受注確認待ち
  | 'ordered'              // 受注済み
  | 'auction_processing'   // オークション手続中
  | 'purchase_recording'   // 【新規】仕入実績登録中
  | 'purchased'            // 仕入完了
  | 'shipment_preparing'   // 【新規】出荷準備中
  | 'shipping'             // 【新規】配送中
  | 'shipped'              // 【新規】配送完了
  | 'invoiced'             // 請求済み
  | 'partial_payment'      // 【新規】部分入金
  | 'payment_received'     // 入金完了
  | 'completed';           // 完了

// 売り注文ステータス
export type SellOrderStatus =
  | 'ordered'              // 受注済み
  | 'vehicle_received'     // 車両預かり中
  | 'auction_processing'   // オークション手続中
  | 'sold'                 // 売却完了
  | 'payment_notified'     // 支払通知済み
  | 'payment_completed'    // 支払完了
  | 'completed';           // 完了

// 仲介売買ステータス
export type MediationOrderStatus =
  | 'ordered'              // 受注済み
  | 'matching'             // マッチング中
  | 'deal_established'     // 取引成立
  | 'invoiced'             // 請求済み
  | 'payment_received'     // 入金完了
  | 'payment_notified'     // 支払通知済み
  | 'payment_completed'    // 支払完了
  | 'completed';           // 完了

// 統合ステータス
export type OrderStatus = BuyOrderStatus | SellOrderStatus | MediationOrderStatus;

export interface Order {
  id: number;
  order_number: string;
  order_type: 'buy' | 'sell' | 'mediation';
  client_id: number;
  buyer_client_id?: number;
  sales_person_id: number;
  status: BuyOrderStatus | SellOrderStatus | MediationOrderStatus;
  order_date: string;
  desired_delivery_date?: string;
  vehicle_count: number;
  purchase_record_ids: number[];
  confirmed_by_client: boolean; // 【新規】顧客確認フラグ
  confirmed_at?: string; // 【新規】確認日時
  notes?: string;
  created_at: string;
  updated_at: string;
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
  changedBy: string; // ユーザーID
  notes?: string;
  createdAt: Date;
}

// 受注登録フォーム入力用
export interface OrderFormInput {
  clientId: string;
  buyerClientId?: string;
  salesPersonId: string;
  orderDate: string;
  desiredDeliveryDate?: string;
  notes?: string;
}

// 買い注文登録フォーム（複数車両対応）
export interface BuyOrderFormInput extends OrderFormInput {
  desiredVehicles: {
    vehicleName: string;
    maker?: string;
    model?: string;
    desiredYearFrom?: number;
    desiredYearTo?: number;
    desiredMileageMax?: number;
    inspectionDateMin?: string;
    color?: string;
    notes?: string;
  }[];
}

// 売り注文登録フォーム（複数車両対応）
export interface SellOrderFormInput extends OrderFormInput {
  vehicles: {
    vehicleName: string;
    maker?: string;
    model?: string;
    year?: number;
    mileage?: number;
    color?: string;
    notes?: string;
  }[];
}

// 仲介売買登録フォーム
export interface MediationOrderFormInput extends OrderFormInput {
  buyerClientId: string; // 必須
}