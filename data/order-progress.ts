import { OrderProgress } from '@/types/order';

export const mockOrderProgress: OrderProgress[] = [
  {
    id: 'progress-001',
    orderId: 'order-001',
    status: 'ordered',
    changedAt: new Date('2024-02-10T10:00:00'),
    changedBy: 'user-002',
    notes: '受注登録',
    createdAt: new Date('2024-02-10T10:00:00'),
  },
  {
    id: 'progress-002',
    orderId: 'order-003',
    status: 'ordered',
    changedAt: new Date('2024-02-05T09:30:00'),
    changedBy: 'user-002',
    notes: '受注登録',
    createdAt: new Date('2024-02-05T09:30:00'),
  },
  {
    id: 'progress-003',
    orderId: 'order-003',
    status: 'auction_processing',
    changedAt: new Date('2024-02-07T14:15:00'),
    changedBy: 'user-002',
    notes: 'オークション入札開始',
    createdAt: new Date('2024-02-07T14:15:00'),
  },
  {
    id: 'progress-004',
    orderId: 'order-003',
    status: 'purchased',
    changedAt: new Date('2024-02-13T16:45:00'),
    changedBy: 'user-002',
    notes: '落札・計算書受領・代金支払い完了',
    createdAt: new Date('2024-02-13T16:45:00'),
  },
];