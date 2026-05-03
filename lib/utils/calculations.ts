/**
 * 消費税計算
 */
export function calculateTax(amount: number, taxRate: number = 0.1): number {
  return Math.floor(amount * taxRate);
}

/**
 * 合計金額計算
 */
export function calculateTotal(
  vehiclePrice: number,
  commission: number,
  tax: number,
  shipmentCost: number = 0,
  otherFee: number = 0
): number {
  return vehiclePrice + commission + tax + shipmentCost + otherFee;
}

/**
 * 平均落札価格計算
 */
export function calculateAverageBidPrice(
  purchaseRecords: Array<{ bid_price: number }>
): number {
  if (purchaseRecords.length === 0) return 0;
  const total = purchaseRecords.reduce((sum, record) => sum + record.bid_price, 0);
  return Math.floor(total / purchaseRecords.length);
}

/**
 * 部分支払額の計算
 */
export function calculateRemaining(totalAmount: number, paidAmount: number): number {
  return Math.max(0, totalAmount - paidAmount);
}

/**
 * ステータス判定
 */
export function determineInvoiceStatus(
  totalAmount: number,
  paidAmount: number,
  dueDate: string
): string {
  const today = new Date();
  const dueDateObj = new Date(dueDate);

  if (paidAmount === 0) {
    return dueDateObj < today ? 'overdue' : 'issued';
  }

  if (paidAmount === totalAmount) {
    return 'paid';
  }

  if (paidAmount > 0 && paidAmount < totalAmount) {
    return 'partial_paid';
  }

  return 'issued';
}