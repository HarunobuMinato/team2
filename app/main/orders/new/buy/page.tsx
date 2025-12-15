'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layouts/page-header';
import { BuyOrderDetailForm } from '@/components/forms/buy-order-detail-form';
import { generateOrderNumber } from '@/lib/utils';

export default function BuyOrderNewPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);

    try {
      // バックエンド実装時のシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 実際はバックエンドに送信
      const orderData = {
        ...formData,
        orderNumber: generateOrderNumber(),
        orderType: 'buy',
        salesPersonId: 'user-002', // デモでは固定
        orderDate: new Date().toISOString().split('T')[0],
      };

      console.log('送信するデータ:', orderData);

      // 成功メッセージ表示
      setSuccessMessage(`受注番号 ${orderData.orderNumber} で登録しました`);

      // 2秒後に一覧画面にリダイレクト
      setTimeout(() => {
        router.push('/orders');
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
        title="買い注文登録"
        subtitle="新規に買い注文を登録します"
        actions={
          <Link href="/orders">
            <Button variant="secondary">戻る</Button>
          </Link>
        }
      />

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">✓ {successMessage}</p>
        </div>
      )}

      <BuyOrderDetailForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
} 