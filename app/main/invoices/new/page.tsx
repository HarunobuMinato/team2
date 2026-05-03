'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layouts/page-header';
import { InvoiceForm } from '@/components/forms/invoice-form';
import { generateInvoiceNumber } from '@/lib/utils';

export default function InvoiceNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');

  const [isLoading, setIsLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);

    try {
      // バックエンド実装時のシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 実際はバックエンドに送信
      const invoiceData = {
        ...formData,
        invoiceNumber: generateInvoiceNumber(),
        status: 'issued',
        paidAmount: 0,
        createdAt: new Date().toISOString(),
      };

      console.log('送信するデータ:', invoiceData);

      // 成功メッセージ表示
      setSuccessMessage(
        `請求書番号 ${invoiceData.invoiceNumber} で作成しました`
      );

      // 2秒後に一覧画面にリダイレクト
      setTimeout(() => {
        router.push('/main/invoices');
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
        title="請求書作成"
        subtitle="複数の納品書から一括請求を作成"
        actions={
          <Link href="/main/invoices">
            <Button variant="secondary">戻る</Button>
          </Link>
        }
      />

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">✓ {successMessage}</p>
        </div>
      )}

      <InvoiceForm
        clientId={clientId || undefined}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}