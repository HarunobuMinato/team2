'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { mockDeliveries } from '@/data/deliveries';
import { mockOrders } from '@/data/orders';
import { mockClients } from '@/data/clients';
import { mockPurchases } from '@/data/purchases';
import {
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_COLORS,
} from '@/constants/status';
import { formatCurrency, formatDateJP } from '@/lib/utils';

export default function DeliveryDetailPage() {
  const params = useParams();
  const deliveryId = params.id as string;
  const [isEditing, setIsEditing] = React.useState(false);
  const [isPrinting, setIsPrinting] = React.useState(false);

  const delivery = mockDeliveries.find((d) => d.id === deliveryId);
  
  // 仕入れ情報を取得（purchaseId がある場合）
  const purchase = delivery?.purchaseId
    ? mockPurchases.find((p) => p.id === delivery.purchaseId)
    : null;

  // 受注情報を取得
  const order = purchase
    ? mockOrders.find((o) => o.id === purchase.orderId)
    : delivery && mockOrders.find((o) => o.id === delivery.orderId);
  
  const client = order ? mockClients.find((c) => c.id === order.clientId) : null;

  // 利益計算（受注金額 - 仕入れ金額）
  const calculateProfit = (): number => {
    if (!order || !purchase) return 0;
    return order.totalAmount - purchase.totalPurchaseAmount;
  };

  if (!delivery) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">納品書が見つかりません</p>
        <Link href="/main/deliveries">
          <Button>納品書一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  const profit = calculateProfit();
  const profitMargin = order ? ((profit / order.totalAmount) * 100).toFixed(1) : '0';

  return (
    <div>
      <PageHeader
        title="納品書詳細"
        subtitle={delivery.deliveryNumber}
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsPrinting(true);
                window.print();
                setIsPrinting(false);
              }}
            >
              🖨️ 印刷
            </Button>
            <Link href="/main/deliveries">
              <Button variant="secondary">戻る</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 基本情報 */}
        <div className="lg:col-span-2">
          {/* 納品書情報 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  納品書情報
                </h2>
                <Badge variant={DELIVERY_STATUS_COLORS[delivery.status]}>
                  {DELIVERY_STATUS_LABELS[delivery.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">納品書番号</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {delivery.deliveryNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">納品日</p>
                  <p className="text-base text-gray-900">
                    {formatDateJP(delivery.deliveryDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">納品場所</p>
                  <p className="text-base text-gray-900">
                    {delivery.deliveryLocation || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">作成日</p>
                  <p className="text-base text-gray-900">
                    {delivery.createdAt
                      ? formatDateJP(delivery.createdAt)
                      : '-'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 受注・仕入れ情報 */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                受注・仕入れ情報
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {/* 受注情報 */}
              <div>
                <p className="text-sm text-gray-600 mb-2">受注情報</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">
                      {order?.orderNumber || '-'}
                    </p>
                    {order && (
                      <Link
                        href={`/main/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        詳細 →
                      </Link>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {order?.orderType === 'buy'
                      ? '買い注文'
                      : order?.orderType === 'sell'
                        ? '売り注文'
                        : '仲介売買'}
                  </p>
                </div>
              </div>

              {/* 仕入れ情報 */}
              {purchase && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">仕入れ情報</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">
                        {purchase.purchaseNumber}
                      </p>
                      <Link
                        href={`/main/purchases/${purchase.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        詳細 →
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">車種</p>
                        <p className="font-medium text-gray-900">
                          {purchase.vehicleName}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">オークション日</p>
                        <p className="font-medium text-gray-900">
                          {formatDateJP(purchase.auctionDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">仕入れ金額</p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(purchase.totalPurchaseAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">支払い状況</p>
                        <p className="font-medium text-gray-900">
                          {purchase.paymentStatus === 'paid'
                            ? '支払済み'
                            : '未支払い'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 顧客情報 */}
              <div>
                <p className="text-sm text-gray-600 mb-2">顧客情報</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-900 mb-1">
                    {client?.name || '-'}
                  </p>
                  {client?.contactPerson && (
                    <p className="text-sm text-gray-600">{client.contactPerson}</p>
                  )}
                  {client?.phone && (
                    <p className="text-sm text-gray-600">{client.phone}</p>
                  )}
                  {client?.email && (
                    <p className="text-sm text-gray-600">{client.email}</p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 車両情報（仕入れから） */}
          {purchase && (
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  車両情報
                </h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">車種</p>
                    <p className="text-base font-medium text-gray-900">
                      {purchase.vehicleName}
                    </p>
                  </div>
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
                      {purchase.mileage
                        ? `${purchase.mileage.toLocaleString()}km`
                        : '-'}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* 備考 */}
          {delivery.notes && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">備考</h2>
              </CardHeader>
              <CardBody>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {delivery.notes}
                </p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* 金額情報 */}
        <div>
          <Card className="sticky top-8 mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">金額情報</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {/* 受注金額 */}
                {order && (
                  <>
                    <div className="pb-3 border-b border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">受注金額</p>
                      <div className="flex justify-between">
                        <span className="text-gray-600">車両価格</span>
                        <span className="font-medium">
                          {formatCurrency(order.vehiclePrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {order.orderType === 'buy' ? '買手' : '売手'}手数料
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            order.orderType === 'buy'
                              ? order.buyCommission
                              : order.sellCommission
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-gray-900 mt-2">
                        <span>受注合計</span>
                        <span className="text-blue-600">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* 仕入れ金額 */}
                {purchase && (
                  <>
                    <div className="pb-3 border-b border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">仕入れ金額</p>
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
                      <div className="flex justify-between font-semibold text-gray-900 mt-2">
                        <span>仕入れ合計</span>
                        <span className="text-green-600">
                          {formatCurrency(purchase.totalPurchaseAmount)}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* 利益分析 */}
                {order && purchase && (
                  <div className="pb-3 border-b border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">利益分析</p>
                    <div className="flex justify-between">
                      <span className="text-gray-600">利益</span>
                      <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(profit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">利益率</span>
                      <span className={`font-semibold ${parseFloat(profitMargin) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profitMargin}%
                      </span>
                    </div>
                  </div>
                )}

                {/* 納品書額（レガシー対応） */}
                <div>
                  <p className="text-xs text-gray-600 mb-2">納品書金額</p>
                  <div className="space-y-2">
                    {delivery.vehiclePrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">車両価格</span>
                        <span className="font-medium">
                          {formatCurrency(delivery.vehiclePrice)}
                        </span>
                      </div>
                    )}

                    {delivery.commission > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">手数料</span>
                        <span className="font-medium">
                          {formatCurrency(delivery.commission)}
                        </span>
                      </div>
                    )}

                    {delivery.otherFee !== 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">その他費用</span>
                        <span className="font-medium">
                          {formatCurrency(delivery.otherFee)}
                        </span>
                      </div>
                    )}

                    {delivery.tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">消費税（10%）</span>
                        <span className="font-medium">
                          {formatCurrency(delivery.tax)}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">
                          納品書合計
                        </span>
                        <span className="text-xl font-bold text-blue-600">
                          {formatCurrency(delivery.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* アクション */}
              <div className="mt-6 space-y-2">
                {delivery.status === 'issued' && (
                  <Button variant="primary" size="sm" className="w-full">
                    📧 得意先に発行
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  ✏️ 編集
                </Button>
                <Button variant="secondary" size="sm" className="w-full">
                  🗑️ 削除
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* ステータス情報 */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                ステータス
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">発行状況</span>
                <Badge variant={DELIVERY_STATUS_COLORS[delivery.status]}>
                  {DELIVERY_STATUS_LABELS[delivery.status]}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">作成者</p>
                <p className="text-base font-medium text-gray-900">
                  システム
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">作成日時</p>
                <p className="text-base text-gray-900">
                  {delivery.createdAt
                    ? formatDateJP(delivery.createdAt)
                    : '-'}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}