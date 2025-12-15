// ユーザーロール
export type UserRole = 'admin' | 'sales' | 'office' | 'customer' | 'vendor';

// ユーザー情報
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clientId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ログイン要求
export interface LoginRequest {
  email: string;
  password: string;
}

// ログイン レスポンス
export interface LoginResponse {
  user: User;
  token: string;
}

// 認証コンテキスト
export interface AuthContext {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}