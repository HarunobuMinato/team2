// ==========================================
// ユーザー認証関連の型定義
// ==========================================

export type UserRole = 'admin' | 'sales' | 'office' | 'customer' | 'vendor';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  clientId?: string; // 顧客/業者ユーザーの場合
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}