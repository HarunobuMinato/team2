'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { mockInvoices } from '@/data/invoices';
import { mockClients } from '@/data/clients';
import { formatCurrency, formatDateJP } from '@/lib/utils';

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const invoice = mockInvoices.find((i) => i.id === invoiceId);
  const client = invoice && mockClients.find((c) => c.id === invoice.clientId);

  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    paymentAmount: invoice ? invoice.totalAmount - invoice.paidAmount : 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    notes: '',
  });

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">請求書が見つかりません</p>
        <Link href="/main/payments">
          <Button>入金管理に戻る</Button>
        </Link>
      </div>
    );
  }

  const remainingAmount = invoice.totalAmount - invoice.paidAmount;
  const isPaid = invoice.paidAmount === invoice.totalAmount;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'paymentAmount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.paymentAmount <= 0) {
      alert('入金金額を入力してください');
      return;
    }

    if (formData.paymentAmount > remainingAmount) {
      alert(`未払い金額（${formatCurrency(remainingAmount)}）を超える金額は入力できません`);
      return;
    }

    setIsLoading(true);

    try {
      // バックエンド実装時のシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('入金登録:', {
        invoiceId,
        ...formData,
      });

      alert('入金を登録しました');

      // 入金管理一覧にリダイレクト
      router.push('/main/payments');
    } catch (error) {
      console.error('エラー:', error);
      alert('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 支払い後の金額計算
  const newPaidAmount = invoice.paidAmount + formData.paymentAmount;
  const newRemainingAmount = invoice.totalAmount - newPaidAmount;
  const newPaymentRate = Math.round((newPaidAmount / invoice.totalAmount) * 100);

  return (
    <div>
      <PageHeader
        title="入金登録"
        subtitle={invoice.invoiceNumber}
        actions={
          <Link href="/main/payments">
            <Button variant="secondary">戻る</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 入金フォーム */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 請求書情報 */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  請求書情報
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">請求書番号</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {invoice.invoiceNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">顧客名</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {client?.name || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">請求日</p>
                    <p className="text-base text-gray-900">
                      {formatDateJP(invoice.invoiceDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">期日</p>
                    <p className="text-base text-gray-900">
                      {formatDateJP(invoice.dueDate)}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* 入金フォーム */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  入金登録
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    入金日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    入金金額 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="paymentAmount"
                    value={formData.paymentAmount}
                    onChange={handleInputChange}
                    max={remainingAmount}
                    min={0}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    未払い金額: {formatCurrency(remainingAmount)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    入金方法 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bank_transfer">銀行振込</option>
                    <option value="check">小切手</option>
                    <option value="cash">現金</option>
                    <option value="credit_card">クレジットカード</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    備考
                  </label>
                  <textarea
                    name="notes"
                    placeholder="入金に関する特記事項"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </CardBody>
              <CardFooter className="flex gap-3 justify-end">
                <Button type="button" variant="secondary" disabled={isLoading}>
                  キャンセル
                </Button>
                <Button type="submit" variant="primary" isLoading={isLoading}>
                  入金を登録
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        {/* 金額情報 */}
        <div>
          <Card className="sticky top-8 mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                現在の支払状況
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">請求合計</span>
                <span className="font-semibold">
                  {formatCurrency(invoice.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">支払済み</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(invoice.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">未払い</span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(remainingAmount)}
                </span>
              </div>

              {/* 支払率 */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">支払率</span>
                  <span className="font-medium">
                    {Math.round((invoice.paidAmount / invoice.totalAmount) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(invoice.paidAmount / invoice.totalAmount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 入金後の予想 */}
          <Card className="bg-blue-50 border border-blue-200">
            <CardHeader>
              <h2 className="text-base font-semibold text-gray-900">
                入金後の予想
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">新しい支払済み</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(newPaidAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">新しい未払い</span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(newRemainingAmount)}
                </span>
              </div>

              <div className="border-t border-blue-200 pt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">新しい支払率</span>
                  <span className="font-medium">{newPaymentRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      newPaymentRate === 100 ? 'bg-green-600' : 'bg-blue-600'
                    }`}
                    style={{
                      width: `${newPaymentRate}%`,
                    }}
                  />
                </div>
              </div>

              {newRemainingAmount === 0 && (
                <div className="p-2 bg-green-100 border border-green-300 rounded mt-3">
                  <p className="text-xs text-green-700 font-medium">
                    ✓ この入金で全額支払が完了します
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}