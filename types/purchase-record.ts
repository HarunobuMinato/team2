// ==========================================
// 仕入実績（PurchaseRecord）の型定義
// オークションで実際に落札・仕入れた車両の実績情報
// ==========================================

export type PurchaseRecordStatus = 'pending' | 'recorded' | 'completed';

export interface PurchaseRecord {
  id: number;
  order_id: number;
  desired_vehicle_id?: number;
  sequence_number: number;
  vehicle_name: string;
  maker?: string;
  model?: string;
  year?: number;
  mileage?: number;
  inspection_date?: string;
  color?: string;
  body_color?: string;
  transmission?: string;
  engine?: string;
  chassis_number?: string;
  registration_number?: string;
  auction_date: string;
  bid_price: number;
  bid_date?: string;
  tax_amount: number; // 【新規】自動車税相当分
  bid_fee: number; // 【新規】成約落札料
  total_purchase_price: number; // 【新規】仕入総額（自動計算）
  status: 'pending' | 'recorded' | 'completed';
  variance_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 仕入実績フォーム入力用
export interface PurchaseRecordFormInput {
  desiredVehicleId?: string;
  auctionId?: string;
  vehicleName: string;
  maker?: string;
  model?: string;
  year?: number;
  mileage?: number;
  inspectionDate?: string;
  color?: string;
  chassisNumber?: string;
  registrationNumber?: string;
  auctionDate: string;
  bidPrice: number;
  varianceReason?: string;
  notes?: string;
}