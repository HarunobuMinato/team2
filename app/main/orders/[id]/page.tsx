'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { mockOrders } from '@/data/orders';
import { mockClients } from '@/data/clients';
import { mockUsers } from '@/data/users';
import { mockPurchases } from '@/data/purchases';
import {
  BUY_ORDER_STATUS_LABELS,
  BUY_ORDER_STATUS_COLORS,
  SELL_ORDER_STATUS_LABELS,
  SELL_ORDER_STATUS_COLORS,
  MEDIATION_ORDER_STATUS_LABELS,
  MEDIATION_ORDER_STATUS_COLORS,
} from '@/constants/status';
import { formatCurrency, formatDateJP } from '@/lib/utils';
import { Order } from '@/types/order';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  // モックデータから受注を取得
  const order = mockOrders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">受注が見つかりません</p>
        <Link href="/main/orders">
          <Button>受注一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  // 関連データの取得
  const client = mockClients.find((c) => c.id === order.clientId);
  const salesPerson = mockUsers.find((u) => u.id === order.salesPersonId);
  const buyerClient =
    order.buyerClientId && mockClients.find((c) => c.id === order.buyerClientId);

  // この受注に関連した仕入れを取得
  const relatedPurchases = mockPurchases.filter(
    (p) => p.orderId === orderId
  );

  // ステータス表示用
  const getStatusLabel = (): string => {
    if (order.orderType === 'buy') {
      return BUY_ORDER_STATUS_LABELS[order.status as any];
    }
    if (order.orderType === 'sell') {
      return SELL_ORDER_STATUS_LABELS[order.status as any];
    }
    return MEDIATION_ORDER_STATUS_LABELS[order.status as any];
  };

  const getStatusColor = (): string => {
    if (order.orderType === 'buy') {
      return BUY_ORDER_STATUS_COLORS[order.status as any];
    }
    if (order.orderType === 'sell') {
      return SELL_ORDER_STATUS_COLORS[order.status as any];
    }
    return MEDIATION_ORDER_STATUS_COLORS[order.status as any];
  };

  const getOrderTypeLabel = (): string => {
    const labels: Record<string, string> = {
      buy: '買い注文',
      sell: '売り注文',
      mediation: '仲介売買',
    };
    return labels[order.orderType] || order.orderType;
  };

  return (
    <div>
      <PageHeader
        title="受注詳細"
        subtitle={`${order.orderNumber} - ${getOrderTypeLabel()}`}
        actions={
          <div className="flex gap-2">
            <Link href={`/main/orders/${orderId}/progress`}>
              <Button variant="primary">進捗管理</Button>
            </Link>
            <Link href="/main/orders">
              <Button variant="secondary">戻る</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 基本情報 */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">基本情報</h2>
                <Badge variant={getStatusColor()}>{getStatusLabel()}</Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">受注番号</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {order.orderNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">注文種別</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {getOrderTypeLabel()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">受注日</p>
                  <p className="text-base text-gray-900">
                    {formatDateJP(order.orderDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">希望納期</p>
                  <p className="text-base text-gray-900">
                    {order.desiredDeliveryDate
                      ? formatDateJP(order.desiredDeliveryDate)
                      : '-'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 関連する仕入れ */}
          {order.orderType === 'buy' && relatedPurchases.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  関連する仕入れ
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {relatedPurchases.map((purchase) => (
                    <Link
                      key={purchase.id}
                      href={`/main/purchases/${purchase.id}`}
                      className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {purchase.purchaseNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {purchase.vehicleName}
                          </p>
                        </div>
                        <Badge
                          variant={
                            purchase.status === 'confirmed'
                              ? 'blue'
                              : purchase.status === 'paid'
                                ? 'green'
                                : 'gray'
                          }
                        >
                          {purchase.status === 'confirmed'
                            ? '確認済み'
                            : purchase.status === 'paid'
                              ? '支払済み'
                              : '完了'}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-blue-600">
                        {formatCurrency(purchase.totalPurchaseAmount)}
                      </p>
                    </Link>
                  ))}
                </div>

                {order.orderType === 'buy' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link href={`/main/purchases/new?orderId=${orderId}`}>
                      <Button type="button" variant="secondary" className="w-full">
                        + 仕入れを追加
                      </Button>
                    </Link>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* 取引先情報 */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">取引先情報</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">依頼者</p>
                  <p className="text-base font-medium text-gray-900">
                    {client?.name || '-'}
                  </p>
                  {client?.contactPerson && (
                    <p className="text-sm text-gray-500">{client.contactPerson}</p>
                  )}
                </div>

                {order.orderType === 'mediation' && buyerClient && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">買い手</p>
                    <p className="text-base font-medium text-gray-900">
                      {buyerClient.name}
                    </p>
                    {buyerClient.contactPerson && (
                      <p className="text-sm text-gray-500">
                        {buyerClient.contactPerson}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-1">営業担当者</p>
                  <p className="text-base font-medium text-gray-900">
                    {salesPerson?.name || '-'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 備考 */}
          {order.notes && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">備考</h2>
              </CardHeader>
              <CardBody>
                <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
              </CardBody>
            </Card>
          )}
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
                  <span className="text-gray-600">車両価格</span>
                  <span className="font-medium">
                    {formatCurrency(order.vehiclePrice)}
                  </span>
                </div>

                {order.orderType === 'buy' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">買手数料</span>
                    <span className="font-medium">
                      {formatCurrency(order.buyCommission)}
                    </span>
                  </div>
                )}

                {order.orderType === 'sell' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">売手数料</span>
                    <span className="font-medium">
                      {formatCurrency(order.sellCommission)}
                    </span>
                  </div>
                )}

                {order.orderType === 'mediation' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">買手数料</span>
                      <span className="font-medium">
                        {formatCurrency(order.buyCommission)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">売手数料</span>
                      <span className="font-medium">
                        {formatCurrency(order.sellCommission)}
                      </span>
                    </div>
                  </>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">合計金額</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* 仕入れ合計を表示 */}
                {relatedPurchases.length > 0 && (
                  <>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <p className="text-sm text-gray-600 mb-2">関連仕入れ合計</p>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">計</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(
                            relatedPurchases.reduce(
                              (sum, p) => sum + p.totalPurchaseAmount,
                              0
                            )
                          )}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}