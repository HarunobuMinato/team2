'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layouts/page-header';
import { PurchaseForm } from '@/components/forms/purchase-form';
import { generatePurchaseNumber } from '@/lib/utils';

export default function PurchaseNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [isLoading, setIsLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);

    try {
      // バックエンド実装時のシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 実際はバックエンドに送信
      const purchaseData = {
        ...formData,
        purchaseNumber: generatePurchaseNumber(),
        status: 'confirmed',
        paymentStatus: 'unpaid',
        createdAt: new Date().toISOString(),
      };

      console.log('送信するデータ:', purchaseData);

      // 確認ページにリダイレクト（IDはモック）
      setSuccessMessage(
        `仕入れ番号 ${purchaseData.purchaseNumber} で登録しました`
      );

      // 2秒後に確認画面にリダイレクト
      setTimeout(() => {
        router.push(`/main/purchases/purchase-001/confirm`);
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
        title="仕入れ登録"
        subtitle="オークション計算書から新規に仕入れを登録します"
        actions={
          <Link href="/main/purchases">
            <Button variant="secondary">戻る</Button>
          </Link>
        }
      />

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">✓ {successMessage}</p>
        </div>
      )}

      <PurchaseForm
        orderId={orderId || undefined}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}