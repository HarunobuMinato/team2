import { UserRole } from "@/types/auth";

// ユーザーロール定義
export const USER_ROLES: UserRole[] = [
  "admin",
  "sales",
  "office",
  "customer",
  "vendor",
];

// 内部ユーザーロール（自社）
export const INTERNAL_ROLES: UserRole[] = ["admin", "sales", "office"];

// 外部ユーザーロール（ポータル）
export const EXTERNAL_ROLES: UserRole[] = ["customer", "vendor"];

// ロール名表示
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "管理者",
  sales: "営業担当者",
  office: "事務員",
  customer: "顧客",
  vendor: "業者",
};

// ロール説明
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "すべての機能へのアクセスと管理権限",
  sales: "受注管理と売上確認",
  office: "請求・入金・支払管理",
  customer: "顧客ポータルでの注文・請求確認",
  vendor: "業者ポータルでの取引確認",
};
