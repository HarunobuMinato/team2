// ============================================
// hooks/usePurchaseRecord.ts【新規・修正版】
// ============================================

import { useState } from 'react';

interface CreatePurchaseRecordInput {
  order_id: number;
  sequence_number: number;
  vehicle_name: string;
  maker?: string;
  model?: string;
  year?: number;
  mileage?: number;
  auction_date: string;
  bid_price: number;
  tax_amount?: number; // 【新規】
  bid_fee?: number; // 【新規】
  body_color?: string;
  transmission?: string;
  engine?: string;
  notes?: string;
}

export function usePurchaseRecord() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRecord = async (data: CreatePurchaseRecordInput) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/purchase-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '仕入実績の作成に失敗しました');
      }

      const result = await response.json();
      setLoading(false);

      return { 
        success: true, 
        data: result.data,
        totalPrice: result.data.total_purchase_price // 計算結果を返す
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(errorMessage);
      setLoading(false);

      return { success: false, error: errorMessage };
    }
  };

  return { createRecord, loading, error };
}
