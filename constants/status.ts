import {
  BuyOrderStatus,
  SellOrderStatus,
  MediationOrderStatus,
} from "@/types/order";
import { InvoiceStatus, PaymentNoticeStatus } from "@/types/invoice";
import { DeliveryStatus, InspectionStep } from "@/types/delivery";

// 買い注文ステータス表示
export const BUY_ORDER_STATUS_LABELS: Record<BuyOrderStatus, string> = {
  ordered: "受注済み",
  auction_processing: "オークション手続中",
  purchased: "仕入完了",
  invoiced: "請求済み",
  payment_received: "入金完了",
  completed: "完了",
};

// 買い注文ステータス色
export const BUY_ORDER_STATUS_COLORS: Record<BuyOrderStatus, string> = {
  ordered: "bg-blue-100 text-blue-800",
  auction_processing: "bg-yellow-100 text-yellow-800",
  purchased: "bg-purple-100 text-purple-800",
  invoiced: "bg-orange-100 text-orange-800",
  payment_received: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
};

// 売り注文ステータス表示
export const SELL_ORDER_STATUS_LABELS: Record<SellOrderStatus, string> = {
  ordered: "受注済み",
  vehicle_received: "車両預かり中",
  auction_processing: "オークション手続中",
  sold: "売却完了",
  payment_notified: "支払通知済み",
  payment_completed: "支払完了",
  completed: "完了",
};

// 売り注文ステータス色
export const SELL_ORDER_STATUS_COLORS: Record<SellOrderStatus, string> = {
  ordered: "bg-blue-100 text-blue-800",
  vehicle_received: "bg-cyan-100 text-cyan-800",
  auction_processing: "bg-yellow-100 text-yellow-800",
  sold: "bg-purple-100 text-purple-800",
  payment_notified: "bg-orange-100 text-orange-800",
  payment_completed: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
};

// 仲介売買ステータス表示
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

// 仲介売買ステータス色
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

// 請求ステータス表示
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "下書き",
  issued: "発行済み",
  paid: "入金完了",
  overdue: "期限超過",
};

// 請求ステータス色
export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  issued: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
};

// 納品書ステータス表示
export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  draft: "下書き",
  issued: "発行済み",
  received: "受領済み",
  inspected: "検収済み",
  completed: "完了",
};

// 納品書ステータス色
export const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  issued: "bg-blue-100 text-blue-800",
  received: "bg-cyan-100 text-cyan-800",
  inspected: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
};

// 検収ステップ表示
export const INSPECTION_STEP_LABELS: Record<InspectionStep, string> = {
  receipt: "納品受領",
  inspection: "検収",
  completed: "完了",
};

// 支払通知ステータス表示
export const PAYMENT_NOTICE_STATUS_LABELS: Record<PaymentNoticeStatus, string> =
  {
    draft: "下書き",
    issued: "発行済み",
    paid: "支払済み",
  };

// 支払通知ステータス色
export const PAYMENT_NOTICE_STATUS_COLORS: Record<PaymentNoticeStatus, string> =
  {
    draft: "bg-gray-100 text-gray-800",
    issued: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
  };

// ユーザーロール表示
export const USER_ROLE_LABELS: Record<string, string> = {
  admin: "管理者",
  sales: "営業担当者",
  office: "事務員",
  customer: "顧客",
  vendor: "業者",
};
