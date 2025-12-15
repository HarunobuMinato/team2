'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layouts/page-header';
import { DeliveryForm } from '@/components/forms/delivery-form';
import { generateDeliveryNumber } from '@/lib/utils';

export default function DeliveryNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const purchaseId = searchParams.get('purchaseId');

  const [isLoading, setIsLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);

    try {
      // バックエンド実装時のシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 実際はバックエンドに送信
      const deliveryData = {
        ...formData,
        deliveryNumber: generateDeliveryNumber(),
        purchaseId: purchaseId || undefined,
        status: 'issued',
        createdAt: new Date().toISOString(),
      };

      console.log('送信するデータ:', deliveryData);

      // 成功メッセージ表示
      setSuccessMessage(`納品書番号 ${deliveryData.deliveryNumber} で作成しました`);

      // 2秒後に一覧画面にリダイレクト
      setTimeout(() => {
        router.push('/main/deliveries');
      }, 2000);
    } catch (error) {
      console.error('エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="納品書作成"
        subtitle="新規に納品書を作成します"
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

      <DeliveryForm
        purchaseId={purchaseId || undefined}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}