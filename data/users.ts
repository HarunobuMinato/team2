import { User } from "@/types/auth";

export const mockUsers: User[] = [
  {
    id: "user-001",
    email: "admin@example.com",
    name: "太郎（管理者）",
    role: "admin",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "user-002",
    email: "sales@example.com",
    name: "花子（営業担当者）",
    role: "sales",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "user-003",
    email: "office@example.com",
    name: "次郎（事務員）",
    role: "office",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "user-004",
    email: "customer@example.com",
    name: "山田太郎（顧客）",
    role: "customer",
    clientId: "client-001",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "user-005",
    email: "vendor@example.com",
    name: "〇〇自動車（業者）",
    role: "vendor",
    clientId: "client-002",
    isActive: true,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
];

// デモ用ユーザー（ログインテスト用）
export const demoUsers = [
  {
    email: "admin@example.com",
    password: "password123",
    name: "太郎（管理者）",
  },
  {
    email: "sales@example.com",
    password: "password123",
    name: "花子（営業担当者）",
  },
  {
    email: "customer@example.com",
    password: "password123",
    name: "山田太郎（顧客）",
  },
];
