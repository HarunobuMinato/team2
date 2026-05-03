'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { mockInvoices } from '@/data/invoices';
import { mockOrders } from '@/data/orders';
import { mockClients } from '@/data/clients';
import { mockDeliveries } from '@/data/deliveries';
import { formatCurrency, formatDateJP } from '@/lib/utils';

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const invoice = mockInvoices.find((i) => i.id === invoiceId);

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">請求書が見つかりません</p>
        <Link href="/main/invoices">
          <Button>請求書一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  // 関連データの取得
  const client = mockClients.find((c) => c.id === invoice.clientId);
  const order = invoice.orderId
    ? mockOrders.find((o) => o.id === invoice.orderId)
    : null;

  // 請求書に紐づいた納品書を取得（invoice.deliveryIds配列から）
  const relatedDeliveries = (invoice.deliveryIds || [])
    .map((id) => mockDeliveries.find((d) => d.id === id))
    .filter(Boolean);

  // ステータス色
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      issued: 'bg-blue-100 text-blue-800',
      partial: 'bg-amber-100 text-amber-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      draft: '下書き',
      issued: '発行済み',
      partial: '部分支払',
      paid: '支払済み',
      overdue: '期限切れ',
    };
    return labels[status] || status;
  };

  const remainingAmount = invoice.totalAmount - invoice.paidAmount;
  const isPaid = invoice.paidAmount === invoice.totalAmount;
  const isPartial =
    invoice.paidAmount > 0 && invoice.paidAmount < invoice.totalAmount;

  return (
    <div>
      <PageHeader
        title="請求書詳細"
        subtitle={invoice.invoiceNumber}
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                window.print();
              }}
            >
              🖨️ 印刷
            </Button>
            <Link href="/main/invoices">
              <Button variant="secondary">戻る</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 基本情報 */}
        <div className="lg:col-span-2">
          {/* 請求書情報 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  請求書情報
                </h2>
                <Badge variant={getStatusColor(invoice.status)}>
                  {getStatusLabel(invoice.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4 mb-6">
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
                  <p className="text-sm text-gray-600 mb-1">納品書件数</p>
                  <p className="text-base font-medium text-gray-900">
                    {relatedDeliveries.length}件
                  </p>
                </div>
              </div>

              {/* 請求先情報 */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  請求先
                </h3>
                <p className="text-base font-medium text-gray-900 mb-1">
                  {client?.name || '-'}
                </p>
                {client?.contactPerson && (
                  <p className="text-sm text-gray-600">{client.contactPerson}</p>
                )}
                {client?.address && (
                  <p className="text-sm text-gray-600 mt-2">{client.address}</p>
                )}
              </div>
            </CardBody>
          </Card>

          {/* 納品書一覧 */}
          {relatedDeliveries.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  対象納品書
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {relatedDeliveries.map((delivery) => (
                    <Link
                      key={delivery?.id}
                      href={`/main/deliveries/${delivery?.id}`}
                      className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {delivery?.deliveryNumber}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDateJP(delivery?.deliveryDate || new Date())}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(delivery?.totalAmount || 0)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* 支払情報 */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">支払情報</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-600">支払方法</span>
                  <span className="font-medium">銀行振込</span>
                </div>

                {invoice.bankAccount && (
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">振込先</p>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">銀行</span>
                        <span className="font-medium">
                          {invoice.bankAccount.bankName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">支店</span>
                        <span className="font-medium">
                          {invoice.bankAccount.branchName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">口座種別</span>
                        <span className="font-medium">
                          {invoice.bankAccount.accountType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">口座番号</span>
                        <span className="font-medium">
                          {invoice.bankAccount.accountNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">名義</span>
                        <span className="font-medium">
                          {invoice.bankAccount.accountHolder}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 金額情報 */}
        <div>
          <Card className="sticky top-8 mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">金額詳細</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">請求金額</span>
                  <span className="font-medium">
                    {formatCurrency(invoice.amount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">消費税（10%）</span>
                  <span className="font-medium">
                    {formatCurrency(invoice.tax)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold text-gray-900">
                      請求合計
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(invoice.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-medium text-gray-900">支払状況</p>
                  <div className="flex justify-between">
                    <span className="text-gray-600">支払済み</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(invoice.paidAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">未払い</span>
                    <span
                      className={`font-medium ${
                        remainingAmount > 0
                          ? 'text-orange-600'
                          : 'text-green-600'
                      }`}
                    >
                      {formatCurrency(remainingAmount)}
                    </span>
                  </div>
                </div>

                {/* 進捗バー */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">支払率</span>
                    <span className="font-medium">
                      {Math.round((invoice.paidAmount / invoice.totalAmount) * 100)}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isPaid
                          ? 'bg-green-600'
                          : isPartial
                            ? 'bg-blue-600'
                            : 'bg-gray-300'
                      }`}
                      style={{
                        width: `${(invoice.paidAmount / invoice.totalAmount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* アクション */}
          {invoice.status !== 'paid' && (
            <Card>
              <CardBody>
                <Button variant="primary" fullWidth className="mb-2">
                  入金登録
                </Button>
                <Button variant="secondary" fullWidth size="sm">
                  編集
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}