'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layouts/page-header';
import { DeliveryForm } from '@/components/forms/delivery-form';

export default function DeliveryNewPage() {
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
      console.log('🔄 納品書登録処理開始');
      console.log('📤 送信するデータ:', formData);

      const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      console.log('📩 レスポンス:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || '納品書の登録に失敗しました');
      }

      console.log(
        `✅ 納品書登録成功 - ID: ${result.data?.id}, 納品書番号: ${result.data?.delivery_number}`
      );

      setSuccessMessage(
        `納品書番号 ${result.data?.delivery_number} で作成しました`
      );

      // 2秒後に一覧にリダイレクト
      setTimeout(() => {
        router.push('/main/deliveries');
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
        title="納品書作成"
        subtitle="受注に対して納品書を作成します"
        actions={
          <Link href="/main/deliveries">
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

      <DeliveryForm
        orderId={orderId || undefined}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}