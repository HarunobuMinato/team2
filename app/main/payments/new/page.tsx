'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layouts/page-header';
import { PaymentForm } from '@/components/forms/payment-form';
import { mockInvoices } from '@/data/invoices';

export default function PaymentNewPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string | undefined;

  const invoice = invoiceId ? mockInvoices.find((i) => i.id === invoiceId) : null;

  const [isLoading, setIsLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);

    try {
      // バックエンド実装時のシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 500));

      const paymentData = {
        ...formData,
        invoiceId: invoice?.id,
        createdAt: new Date().toISOString(),
      };

      console.log('送信するデータ:', paymentData);

      // 成功メッセージ表示
      setSuccessMessage('入金を登録しました');

      // 2秒後に請求書詳細にリダイレクト
      setTimeout(() => {
        if (invoice) {
          router.push(`/invoices/${invoice.id}`);
        } else {
          router.push('/invoices');
        }
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
        title="入金登録"
        subtitle="新規に入金を登録します"
        actions={
          <Link href={invoice ? `/invoices/${invoice.id}` : '/invoices'}>
            <Button variant="secondary">戻る</Button>
          </Link>
        }
      />

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">✓ {successMessage}</p>
        </div>
      )}

      <PaymentForm
        invoiceNumber={invoice?.invoiceNumber}
        invoiceAmount={invoice?.totalAmount}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}