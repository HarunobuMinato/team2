// ============================================
// hooks/useOrderConfirm.ts【新規】
// ============================================

import { useState } from 'react';

export function useOrderConfirm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmOrder = async (orderId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('受注の確認に失敗しました');
      }

      const data = await response.json();
      setLoading(false);

      return { success: true, data: data.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(errorMessage);
      setLoading(false);

      return { success: false, error: errorMessage };
    }
  };

  return { confirmOrder, loading, error };
}