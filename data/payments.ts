import { Payment, PaymentNotice, Payout } from '@/types/invoice';

// 入金データ
export const mockPayments: Payment[] = [
  {
    id: 'payment-001',
    invoiceId: 'invoice-002',
    paymentDate: new Date('2024-02-10'),
    amount: 1122000,
    paymentMethod: 'bank_transfer',
    bankName: '〇〇銀行',
    referenceNumber: 'REF-2024-0001',
    notes: '入金確認済み',
    createdAt: new Date('2024-02-10'),
  },
];

// 支払通知書（得意先に送付）
export const mockPaymentNotices: PaymentNotice[] = [
  {
    id: 'notice-001',
    noticeNumber: 'PN-202402-0001',
    clientId: 'client-001',
    invoiceCount: 1,
    totalAmount: 1969000,
    totalTax: 179000,
    grandTotal: 2148000,
    dueDate: new Date('2024-03-25'),
    paymentMethod: 'bank_transfer',
    bankAccount: {
      bankName: '〇〇銀行',
      branchName: '本店',
      accountType: '普通',
      accountNumber: '1234567',
      accountHolder: '株式会社〇〇',
    },
    notes: '',
    issuedDate: new Date('2024-02-25'),
    createdAt: new Date('2024-02-25'),
  },
  {
    id: 'notice-002',
    noticeNumber: 'PN-202402-0002',
    clientId: 'client-003',
    invoiceCount: 1,
    totalAmount: 1020000,
    totalTax: 102000,
    grandTotal: 1122000,
    dueDate: new Date('2024-03-25'),
    paymentMethod: 'bank_transfer',
    bankAccount: {
      bankName: '〇〇銀行',
      branchName: '本店',
      accountType: '普通',
      accountNumber: '1234567',
      accountHolder: '株式会社〇〇',
    },
    notes: '既払い',
    issuedDate: new Date('2024-02-25'),
    createdAt: new Date('2024-02-25'),
  },
];

// 配当金/給与（営業担当者向け）
export const mockPayouts: Payout[] = [
  {
    id: 'payout-001',
    payoutNumber: 'PAYOUT-202402-0001',
    salesPersonId: 'user-002',
    month: new Date('2024-02-01'),
    baseAmount: 300000,
    commission: 50000,
    totalAmount: 350000,
    paymentDate: new Date('2024-02-28'),
    status: 'completed',
    notes: 'February payout',
    createdAt: new Date('2024-02-28'),
  },
  {
    id: 'payout-002',
    payoutNumber: 'PAYOUT-202403-0001',
    salesPersonId: 'user-002',
    month: new Date('2024-03-01'),
    baseAmount: 300000,
    commission: 30000,
    totalAmount: 330000,
    paymentDate: new Date('2024-03-31'),
    status: 'pending',
    notes: 'March payout pending',
    createdAt: new Date('2024-03-15'),
  },
];