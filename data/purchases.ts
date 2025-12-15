import { Purchase } from '@/types/purchase';

export const mockPurchases: Purchase[] = [
  {
    id: 'purchase-001',
    purchaseNumber: 'PUR-2024-001',
    orderId: 'order-001',
    auctionVenueId: 'venue-001',
    auctionDate: new Date('2024-02-14'),
    auctionNumber: '20240214-001',
    
    vehicleName: 'セルシオ',
    maker: 'トヨタ',
    model: 'GRX120',
    year: 2023,
    mileage: 25000,
    
    bidPrice: 1500000,
    auctionFee: 15000,
    transportFee: 30000,
    otherFee: 5000,
    tax: 155000,
    totalPurchaseAmount: 1705000,
    
    statementReceivedDate: new Date('2024-02-15'),
    paymentDueDate: new Date('2024-02-25'),
    paymentStatus: 'unpaid',
    
    status: 'confirmed',
    notes: '良好な状態で落札',
    
    isDeleted: false,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: 'purchase-002',
    purchaseNumber: 'PUR-2024-002',
    orderId: 'order-002',
    auctionVenueId: 'venue-002',
    auctionDate: new Date('2024-02-12'),
    auctionNumber: '20240212-005',
    
    vehicleName: '3シリーズ',
    maker: 'BMW',
    model: 'F30',
    year: 2022,
    mileage: 35000,
    
    bidPrice: 2000000,
    auctionFee: 20000,
    transportFee: 40000,
    otherFee: 8000,
    tax: 206800,
    totalPurchaseAmount: 2274800,
    
    statementReceivedDate: new Date('2024-02-13'),
    paymentDueDate: new Date('2024-02-28'),
    paymentStatus: 'paid',
    paidDate: new Date('2024-02-20'),
    
    status: 'paid',
    notes: '',
    
    isDeleted: false,
    createdAt: new Date('2024-02-13'),
    updatedAt: new Date('2024-02-20'),
  },
  {
    id: 'purchase-003',
    purchaseNumber: 'PUR-2024-003',
    orderId: 'order-003',
    auctionVenueId: 'venue-001',
    auctionDate: new Date('2024-02-10'),
    auctionNumber: '20240210-003',
    
    vehicleName: 'アルファード',
    maker: 'トヨタ',
    model: 'ANH25',
    year: 2021,
    mileage: 45000,
    
    bidPrice: 1200000,
    auctionFee: 12000,
    transportFee: 25000,
    otherFee: 3000,
    tax: 124000,
    totalPurchaseAmount: 1364000,
    
    statementReceivedDate: new Date('2024-02-11'),
    paymentDueDate: new Date('2024-02-20'),
    paymentStatus: 'paid',
    paidDate: new Date('2024-02-18'),
    
    status: 'completed',
    notes: 'エアロ社外、テールランプ社外',
    
    isDeleted: false,
    createdAt: new Date('2024-02-11'),
    updatedAt: new Date('2024-02-20'),
  },
];