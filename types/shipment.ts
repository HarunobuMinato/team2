// ==========================================
// 出荷（Shipment）の型定義
// 複数の仕入実績をまとめて出荷し、陸送会社に配送を依頼する情報
// ==========================================

export type ShipmentStatus = 'draft' | 'confirmed' | 'in_transit' | 'delivered' | 'completed';

export interface Shipment {
  id: string;
  shipmentNumber: string; // 出荷番号（UNIQUE）
  orderId: string; // FK: 受注ID
  clientId: string; // FK: 依頼者/配送先（取引先ID）
  shipmentDate: Date; // 出荷日
  pickupDate?: Date; // 集荷日
  deliveryDate?: Date; // 配送予定日
  status: ShipmentStatus; // ステータス
  vehicleCount: number; // 出荷車両台数
  transportCompanyId?: string; // FK: 陸送業者ID
  transportCost: number; // 陸送費用（顧客負担）
  transportNotes?: string; // 陸送に関する特記事項
  totalVehicleAmount: number; // 出荷車両の合計金額
  totalShipmentCost: number; // 合計費用（車両+陸送）
  notes?: string; // 備考
  createdAt: Date;
  createdBy?: string; // 作成者（ユーザーID）
  updatedAt: Date;
  updatedBy?: string; // 更新者（ユーザーID）
}

// 出荷に含まれる仕入実績
export interface ShipmentPurchase {
  id: string;
  shipmentId: string; // FK: 出荷ID
  purchaseRecordId: string; // FK: 仕入実績ID
  sequenceNumber: number; // 順序番号
  vehicleName: string; // 車種名（仕入実績時点のキャッシュ）
  bidPrice: number; // 落札価格（仕入実績時点のキャッシュ）
  createdAt: Date;
}

// 出荷登録フォーム入力用
export interface ShipmentFormInput {
  orderId: string;
  clientId: string;
  shipmentDate: string;
  pickupDate?: string;
  deliveryDate?: string;
  purchaseRecordIds: string[]; // 複数選択
  transportCompanyId?: string;
  transportCost: number;
  transportNotes?: string;
  notes?: string;
}

// 出荷詳細（関連データを含む）
export interface ShipmentDetail extends Shipment {
  purchases?: ShipmentPurchase[];
  transportCompany?: {
    id: string;
    name: string;
    phone?: string;
  };
}