'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { mockPurchases } from '@/data/purchases';
import { mockOrders } from '@/data/orders';
import { mockClients } from '@/data/clients';
import { formatCurrency, formatDateJP } from '@/lib/utils';

export default function PurchaseDetailPage() {
  const params = useParams();
  const purchaseId = params.id as string;

  // モックデータから仕入れを取得
  const purchase = mockPurchases.find((p) => p.id === purchaseId);

  if (!purchase) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">仕入れが見つかりません</p>
        <Link href="/main/purchases">
          <Button>仕入れ一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  // 関連データの取得
  const order = mockOrders.find((o) => o.id === purchase.orderId);
  const client = order ? mockClients.find((c) => c.id === order.clientId) : null;

  // ステータス色
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      draft: 'gray',
      confirmed: 'blue',
      paid: 'green',
      completed: 'gray',
    };
    return colors[status] || 'gray';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      draft: '下書き',
      confirmed: '確認済み',
      paid: '支払済み',
      completed: '完了',
    };
    return labels[status] || status;
  };

  const getPaymentStatusLabel = (status: string): string => {
    return status === 'paid' ? '支払済み' : '未支払い';
  };

  return (
    <div>
      <PageHeader
        title="仕入れ詳細"
        subtitle={`${purchase.purchaseNumber} - ${purchase.vehicleName}`}
        actions={
          <div className="flex gap-2">
            <Link href={`/main/purchases/${purchaseId}/confirm`}>
              <Button variant="primary">確認画面</Button>
            </Link>
            <Link href="/main/purchases">
              <Button variant="secondary">戻る</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 基本情報 */}
        <div className="lg:col-span-2">
          {/* オークション情報 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  オークション情報
                </h2>
                <Badge variant={getStatusColor(purchase.status)}>
                  {getStatusLabel(purchase.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">仕入れ番号</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {purchase.purchaseNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">オークション日</p>
                  <p className="text-base text-gray-900">
                    {formatDateJP(purchase.auctionDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">オークション番号</p>
                  <p className="text-base text-gray-900">
                    {purchase.auctionNumber || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">計算書受領日</p>
                  <p className="text-base text-gray-900">
                    {formatDateJP(purchase.statementReceivedDate)}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 車両情報 */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">車両情報</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">車種名</p>
                  <p className="text-base font-medium text-gray-900">
                    {purchase.vehicleName}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">メーカー</p>
                    <p className="text-base text-gray-900">
                      {purchase.maker || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">型式</p>
                    <p className="text-base text-gray-900">
                      {purchase.model || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">年式</p>
                    <p className="text-base text-gray-900">
                      {purchase.year || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">走行距離</p>
                    <p className="text-base text-gray-900">
                      {purchase.mileage ? `${purchase.mileage.toLocaleString()}km` : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 取引先情報 */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">取引先情報</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">受注番号</p>
                  {order ? (
                    <Link
                      href={`/main/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {order.orderNumber}
                    </Link>
                  ) : (
                    <p className="text-base text-gray-900">-</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">顧客名</p>
                  <p className="text-base font-medium text-gray-900">
                    {client?.name || '-'}
                  </p>
                  {client?.contactPerson && (
                    <p className="text-sm text-gray-500">{client.contactPerson}</p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 支払い情報 */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">支払い情報</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">支払いステータス</span>
                  <Badge
                    variant={
                      purchase.paymentStatus === 'paid' ? 'green' : 'orange'
                    }
                  >
                    {getPaymentStatusLabel(purchase.paymentStatus)}
                  </Badge>
                </div>
                {purchase.paymentDueDate && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">支払期限</p>
                    <p className="text-base text-gray-900">
                      {formatDateJP(purchase.paymentDueDate)}
                    </p>
                  </div>
                )}
                {purchase.paidDate && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">支払い日</p>
                    <p className="text-base text-gray-900">
                      {formatDateJP(purchase.paidDate)}
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 金額情報 */}
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">金額情報</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">落札価格</span>
                  <span className="font-medium">
                    {formatCurrency(purchase.bidPrice)}
                  </span>
                </div>

                {purchase.auctionFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">オークション手数料</span>
                    <span className="font-medium">
                      {formatCurrency(purchase.auctionFee)}
                    </span>
                  </div>
                )}

                {purchase.transportFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">陸送費</span>
                    <span className="font-medium">
                      {formatCurrency(purchase.transportFee)}
                    </span>
                  </div>
                )}

                {purchase.otherFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">その他費用</span>
                    <span className="font-medium">
                      {formatCurrency(purchase.otherFee)}
                    </span>
                  </div>
                )}

                {purchase.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">消費税</span>
                    <span className="font-medium">
                      {formatCurrency(purchase.tax)}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">仕入れ合計</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(purchase.totalPurchaseAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}