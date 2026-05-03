import {
  BuyOrderStatus,
  SellOrderStatus,
  MediationOrderStatus,
} from "@/types/order";
import { InvoiceStatus, PaymentNoticeStatus } from "@/types/invoice";
import { ShipmentStatus } from "@/types/shipment";
import { DeliveryStatus, InspectionStatus } from "@/types/delivery";


// 買い注文ステータス【更新】
export const BUY_ORDER_STATUS_LABELS: Record<BuyOrderStatus, string> = {
  order_pending: '受注確認待ち', // 【新規】
  ordered: '受注済み',
  auction_processing: 'オークション手続中',
  purchase_recording: '仕入実績登録中',
  purchased: '仕入完了',
  shipment_preparing: '出荷準備中',
  shipping: '配送中',
  shipped: '配送完了',
  invoiced: '請求済み',
  partial_payment: '部分入金',
  payment_received: '入金完了',
  completed: '完了',
};

export const BUY_ORDER_STATUS_COLORS: Record<BuyOrderStatus, string> = {
  order_pending: 'bg-amber-100 text-amber-800', // 【新規】
  ordered: 'bg-blue-100 text-blue-800',
  auction_processing: 'bg-yellow-100 text-yellow-800',
  purchase_recording: 'bg-indigo-100 text-indigo-800',
  purchased: 'bg-purple-100 text-purple-800',
  shipment_preparing: 'bg-cyan-100 text-cyan-800',
  shipping: 'bg-amber-100 text-amber-800',
  shipped: 'bg-green-100 text-green-800',
  invoiced: 'bg-orange-100 text-orange-800',
  partial_payment: 'bg-red-100 text-red-800',
  payment_received: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
};

// ==========================================
// 売り注文ステータス
// ==========================================
export const SELL_ORDER_STATUS_LABELS: Record<SellOrderStatus, string> = {
  ordered: "受注済み",
  vehicle_received: "車両預かり中",
  auction_processing: "オークション手続中",
  sold: "売却完了",
  payment_notified: "支払通知済み",
  payment_completed: "支払完了",
  completed: "完了",
};

export const SELL_ORDER_STATUS_COLORS: Record<SellOrderStatus, string> = {
  ordered: "bg-blue-100 text-blue-800",
  vehicle_received: "bg-cyan-100 text-cyan-800",
  auction_processing: "bg-yellow-100 text-yellow-800",
  sold: "bg-purple-100 text-purple-800",
  payment_notified: "bg-orange-100 text-orange-800",
  payment_completed: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
};

// ==========================================
// 仲介売買ステータス
// ==========================================
export const MEDIATION_ORDER_STATUS_LABELS: Record<
  MediationOrderStatus,
  string
> = {
  ordered: "受注済み",
  matching: "マッチング中",
  deal_established: "取引成立",
  invoiced: "請求済み",
  payment_received: "入金完了",
  payment_notified: "支払通知済み",
  payment_completed: "支払完了",
  completed: "完了",
};

export const MEDIATION_ORDER_STATUS_COLORS: Record<
  MediationOrderStatus,
  string
> = {
  ordered: "bg-blue-100 text-blue-800",
  matching: "bg-indigo-100 text-indigo-800",
  deal_established: "bg-purple-100 text-purple-800",
  invoiced: "bg-orange-100 text-orange-800",
  payment_received: "bg-cyan-100 text-cyan-800",
  payment_notified: "bg-orange-100 text-orange-800",
  payment_completed: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
};

// ==========================================
// 請求ステータス【更新】
// ==========================================
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "下書き",
  issued: "発行済み",
  partial: "部分支払",
  partial_paid: "部分支払",
  paid: "入金完了",
  overdue: "期限超過",
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  issued: "bg-blue-100 text-blue-800",
  partial: "bg-yellow-100 text-yellow-800",
  partial_paid: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
};

// ==========================================
// 出荷ステータス【新規】
// ==========================================
export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  draft: "下書き",
  confirmed: "確認済み",
  in_transit: "配送中",
  delivered: "配送完了",
  completed: "完了",
};

export const SHIPMENT_STATUS_COLORS: Record<ShipmentStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_transit: "bg-amber-100 text-amber-800",
  delivered: "bg-green-100 text-green-800",
  completed: "bg-gray-400 text-gray-800",
};

// ==========================================
// 支払通知ステータス
// ==========================================
export const PAYMENT_NOTICE_STATUS_LABELS: Record<PaymentNoticeStatus, string> =
  {
    draft: "下書き",
    issued: "発行済み",
    paid: "支払済み",
  };

export const PAYMENT_NOTICE_STATUS_COLORS: Record<PaymentNoticeStatus, string> =
  {
    draft: "bg-gray-100 text-gray-800",
    issued: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
  };

// ==========================================
// 納品書ステータス【新規】
// ==========================================
export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  draft: "下書き",
  issued: "発行済み",
  received: "受領済み",
  inspected: "検収完了",
  completed: "完了",
};

export const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  issued: "bg-blue-100 text-blue-800",
  received: "bg-cyan-100 text-cyan-800",
  inspected: "bg-green-100 text-green-800",
  completed: "bg-gray-400 text-gray-800",
};

// ==========================================
// 検収ステータス【新規】
// ==========================================
export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  pending: "保留中",
  ok: "良好 - 異常なし",
  ng: "不良 - 問題あり",
  completed: "完了",
};

export const INSPECTION_STATUS_COLORS: Record<InspectionStatus, string> = {
  pending: "bg-gray-100 text-gray-800",
  ok: "bg-green-100 text-green-800",
  ng: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
};

// ==========================================
// ユーザーロール表示
// ==========================================
export const USER_ROLE_LABELS: Record<string, string> = {
  admin: "管理者",
  sales: "営業担当者",
  office: "事務員",
  customer: "顧客",
  vendor: "業者",
};

// ==========================================
// ステータスの進捗率【新規】
// ==========================================
export const BUY_ORDER_PROGRESS: Record<BuyOrderStatus, number> = {
  ordered: 10,
  auction_processing: 20,
  purchase_recording: 30,
  purchased: 40,
  shipment_preparing: 50,
  shipping: 60,
  shipped: 70,
  invoiced: 80,
  partial_payment: 85,
  payment_received: 90,
  completed: 100,
};

export const INVOICE_PROGRESS: Record<InvoiceStatus, number> = {
  draft: 0,
  issued: 25,
  partial: 50,
  partial_paid: 50,
  paid: 100,
  overdue: 25,
};