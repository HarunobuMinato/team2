'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { mockInvoices } from '@/data/invoices';
import { mockUsers } from '@/data/users';
import { formatCurrency, formatDateJP } from '@/lib/utils';
import { User } from '@/types/auth';

interface PaymentAllocation {
  invoiceId: string;
  invoiceNumber: string;
  remainingAmount: number;
  allocatedAmount: number;
}

export default function PortalInvoicePaymentPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [user, setUser] = React.useState<User | null>(null);
  const invoice = mockInvoices.find((i) => i.id === invoiceId);

  const [paymentAmount, setPaymentAmount] = React.useState(
    invoice ? invoice.totalAmount - invoice.paidAmount : 0
  );
  const [paymentMethod, setPaymentMethod] = React.useState('bank_transfer');
  const [notes, setNotes] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [allocations, setAllocations] = React.useState<PaymentAllocation[]>([]);
  const [showAllocationDetail, setShowAllocationDetail] = React.useState(false);

  // ユーザー情報取得
  React.useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      const fullUser = mockUsers.find((u) => u.email === userData.email);
      if (fullUser) {
        setUser(fullUser);
      }
    }
  }, []);

  if (!invoice || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">情報が見つかりません</p>
        <Link href="/portal/invoices">
          <Button>請求書一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  // ユーザーの他の未払い請求書を取得
  const userUnpaidInvoices = mockInvoices
    .filter((i) => i.clientId === user.clientId && i.id !== invoiceId)
    .map((i) => ({
      invoiceId: i.id,
      invoiceNumber: i.invoiceNumber,
      remainingAmount: i.totalAmount - i.paidAmount,
      allocatedAmount: 0,
    }))
    .filter((i) => i.remainingAmount > 0);

  const currentInvoiceRemaining = invoice.totalAmount - invoice.paidAmount;

  // 一括自動引き当て
  const handleAutoAllocate = () => {
    if (paymentAmount <= 0) {
      alert('支払い金額を入力してください');
      return;
    }

    const newAllocations: PaymentAllocation[] = [];
    let remainingPayment = paymentAmount;

    // 現在の請求書に引き当て
    const currentAllocation = Math.min(remainingPayment, currentInvoiceRemaining);
    if (currentAllocation > 0) {
      newAllocations.push({
        invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        remainingAmount: currentInvoiceRemaining,
        allocatedAmount: currentAllocation,
      });
      remainingPayment -= currentAllocation;
    }

    // 他の未払い請求書に引き当て（古い順）
    const sortedUnpaidInvoices = userUnpaidInvoices.sort(
      (a, b) =>
        new Date(
          mockInvoices.find((i) => i.id === a.invoiceId)?.invoiceDate || 0
        ).getTime() -
        new Date(
          mockInvoices.find((i) => i.id === b.invoiceId)?.invoiceDate || 0
        ).getTime()
    );

    for (const unpaidInvoice of sortedUnpaidInvoices) {
      if (remainingPayment <= 0) break;

      const allocation = Math.min(remainingPayment, unpaidInvoice.remainingAmount);
      if (allocation > 0) {
        newAllocations.push({
          ...unpaidInvoice,
          allocatedAmount: allocation,
        });
        remainingPayment -= allocation;
      }
    }

    setAllocations(newAllocations);
    setShowAllocationDetail(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentAmount <= 0) {
      alert('支払い金額を入力してください');
      return;
    }

    if (allocations.length === 0) {
      alert('一括自動引き当てを実行してください');
      return;
    }

    setIsLoading(true);

    try {
      // バックエンド実装時のシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('支払い登録:', {
        totalPaymentAmount: paymentAmount,
        paymentMethod,
        notes,
        allocations,
        paymentDate: new Date().toISOString().split('T')[0],
      });

      alert('支払いを登録しました');

      // 請求書一覧にリダイレクト
      router.push('/portal/invoices');
    } catch (error) {
      console.error('エラー:', error);
      alert('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 合計支払い金額の検証
  const totalAllocated = allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
  const isValid = totalAllocated === paymentAmount;

  return (
    <div>
      <PageHeader
        title="支払い登録"
        subtitle={invoice.invoiceNumber}
        actions={
          <Link href="/portal/invoices">
            <Button variant="secondary">戻る</Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 支払い入力フォーム */}
        <div className="lg:col-span-2">
          {/* 請求書情報 */}
          <Card className="mb-6">
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
                <div>
                  <p className="text-sm text-gray-600 mb-1">請求金額</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(invoice.totalAmount)}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 支払い入力 */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                支払い入力
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  支払い金額 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  min={0}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  当請求書の未払い: {formatCurrency(currentInvoiceRemaining)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  支払方法 <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bank_transfer">銀行振込</option>
                  <option value="check">小切手</option>
                  <option value="cash">現金</option>
                  <option value="credit_card">クレジットカード</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備考
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="支払いに関する特記事項"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button
                type="button"
                variant="primary"
                onClick={handleAutoAllocate}
                fullWidth
              >
                💡 一括自動引き当て
              </Button>
            </CardBody>
          </Card>

          {/* 引き当て結果 */}
          {showAllocationDetail && (
            <Card className="mb-6 bg-blue-50 border border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    引き当て結果
                  </h2>
                  {isValid && (
                    <Badge variant="bg-green-100 text-green-800">
                      ✓ 全額配分完了
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {allocations.map((allocation) => (
                    <div
                      key={allocation.invoiceId}
                      className="p-3 bg-white rounded-lg border border-blue-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {allocation.invoiceNumber}
                          </p>
                          <p className="text-xs text-gray-500">
                            未払い: {formatCurrency(allocation.remainingAmount)}
                          </p>
                        </div>
                        <p className="font-bold text-blue-600">
                          {formatCurrency(allocation.allocatedAmount)}
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{
                            width: `${
                              (allocation.allocatedAmount /
                                allocation.remainingAmount) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-blue-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">
                        合計配分額
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(totalAllocated)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* 送信ボタン */}
          {showAllocationDetail && (
            <CardFooter className="flex gap-3 justify-end p-0">
              <Button type="button" variant="secondary" disabled={isLoading}>
                キャンセル
              </Button>
              <Button
                type="submit"
                variant={isValid ? 'primary' : 'secondary'}
                isLoading={isLoading}
                disabled={!isValid}
              >
                支払いを登録
              </Button>
            </CardFooter>
          )}
        </div>

        {/* 右サイドバー */}
        <div>
          {/* 現在の請求書 */}
          <Card className="sticky top-8 mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                本請求書の状況
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">請求金額</span>
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
                  {formatCurrency(currentInvoiceRemaining)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">支払率</span>
                  <span className="font-medium">
                    {Math.round((invoice.paidAmount / invoice.totalAmount) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(invoice.paidAmount / invoice.totalAmount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 他の未払い請求書 */}
          {userUnpaidInvoices.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-gray-900">
                  他の未払い請求書
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {userUnpaidInvoices.map((unpaidInvoice) => (
                    <div
                      key={unpaidInvoice.invoiceId}
                      className="p-2 bg-gray-50 rounded border border-gray-200"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {unpaidInvoice.invoiceNumber}
                      </p>
                      <p className="text-xs text-orange-600 font-semibold">
                        {formatCurrency(unpaidInvoice.remainingAmount)}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  💡 支払い金額がこれらの請求書の合計を上回る場合、
                  古い請求書から順に充当されます
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </form>
    </div>
  );
}