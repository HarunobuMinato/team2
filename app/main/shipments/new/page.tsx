'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layouts/page-header';
import { ShipmentForm } from '@/components/forms/shipment-form';

export default function ShipmentNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 出荷登録処理開始');
      console.log('📤 送信するデータ:', formData);

      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      console.log('📩 レスポンス:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || '出荷の登録に失敗しました');
      }

      console.log(`✅ 出荷登録成功 - ID: ${result.data?.id}, 出荷番号: ${result.data?.shipment_number}`);

      setSuccessMessage(
        `出荷番号 ${result.data?.shipment_number} で登録しました`
      );

      // 2秒後に一覧にリダイレクト
      setTimeout(() => {
        router.push('/main/shipments');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました';
      console.error('❌ エラー:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="出荷登録"
        subtitle="複数の仕入実績車両をまとめて出荷"
        actions={
          <Link href="/main/shipments">
            <Button variant="secondary">戻る</Button>
          </Link>
        }
      />

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">✓ {successMessage}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">❌ {error}</p>
        </div>
      )}

      <ShipmentForm
        orderId={orderId || undefined}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}