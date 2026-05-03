// ==========================================
// 希望車両（DesiredVehicle）の型定義
// 受注時に顧客から指定された車両仕様（買い注文の場合）
// ==========================================

export interface DesiredVehicle {
  id: string;
  orderId: string; // FK: 受注ID
  sequenceNumber: number; // 順序番号（同じorder_idで複数車両の場合の順序）
  vehicleName: string; // 車種名
  maker?: string; // メーカー
  model?: string; // 型式
  desiredYearFrom?: number; // 希望年式（開始）
  desiredYearTo?: number; // 希望年式（終了）
  desiredMileageMax?: number; // 希望走行距離上限（km）
  inspectionDateMin?: Date; // 希望車検期限（最小）
  color?: string; // 色（希望）
  notes?: string; // 備考（希望仕様）
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 希望車両フォーム入力用
export interface DesiredVehicleFormInput {
  vehicleName: string;
  maker?: string;
  model?: string;
  desiredYearFrom?: number;
  desiredYearTo?: number;
  desiredMileageMax?: number;
  inspectionDateMin?: string;
  color?: string;
  notes?: string;
}