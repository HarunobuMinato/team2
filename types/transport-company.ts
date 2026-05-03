// ==========================================
// 陸送業者（TransportCompany）マスタの型定義
// ==========================================

export interface TransportCompany {
  id: string;
  companyCode: string; // UNIQUE
  name: string;
  nameKana?: string;
  phone?: string;
  address?: string;
  email?: string;
  contactPerson?: string;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 陸送業者フォーム入力用
export interface TransportCompanyFormInput {
  companyCode: string;
  name: string;
  nameKana?: string;
  phone?: string;
  address?: string;
  email?: string;
  contactPerson?: string;
  notes?: string;
}