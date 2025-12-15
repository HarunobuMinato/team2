// 取引先種別
export type ClientType = 'customer' | 'vendor';

// 個人/法人
export type PersonType = 'individual' | 'corporate';

// 取引先情報
export interface Client {
  id: string;
  clientCode: string;
  clientType: ClientType;
  name: string;
  nameKana?: string;
  personType?: PersonType;
  contactPerson?: string;
  postalCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountType?: 'ordinary' | 'current';
  bankAccountNumber?: string;
  bankAccountName?: string;
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}