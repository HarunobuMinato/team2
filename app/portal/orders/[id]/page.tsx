'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { mockOrders } from '@/data/orders';
import { mockOrderProgress } from '@/data/order-progress';
import {
  BUY_ORDER_STATUS_LABELS,
  BUY_ORDER_STATUS_COLORS,
} from '@/constants/status';
import { formatCurrency, formatDateJP } from '@/lib/utils';

export default function PortalOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const order = mockOrders.find((o) => o.id === orderId);
  const progress = mockOrderProgress.filter((p) => p.orderId === orderId);

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">注文が見つかりません</p>
        <Link href="/portal/portal/orders">
          <Button>注文一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="注文詳細"
        subtitle={order.orderNumber}
        actions={
          <Link href="/portal/portal/orders">
            <Button variant="secondary">戻る</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 注文詳細 */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">注文情報</h2>
                <Badge variant={BUY_ORDER_STATUS_COLORS[order.status as any]}>
                  {BUY_ORDER_STATUS_LABELS[order.status as any]}
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">注文番号</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {order.orderNumber}
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
                <div>
                  <p className="text-sm text-gray-600 mb-1">営業担当者</p>
                  <p className="text-base text-gray-900">営業担当者</p>
                </div>
              </div>

              {order.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">備考</p>
                  <p className="text-gray-700">{order.notes}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* 進捗状況 */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">進捗状況</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {progress.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    進捗情報がまだありません
                  </p>
                ) : (
                  <>
                    {/* タイムライン */}
                    <div className="space-y-4">
                      {progress.map((p, index) => (
                        <div key={p.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-4 h-4 rounded-full bg-blue-600 flex-shrink-0" />
                            {index < progress.length - 1 && (
                              <div className="w-1 h-12 bg-blue-200 my-1" />
                            )}
                          </div>
                          <div className="pb-4">
                            <p className="font-medium text-gray-900">
                              {BUY_ORDER_STATUS_LABELS[p.status as any]}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDateJP(p.changedAt)}
                            </p>
                            {p.notes && (
                              <p className="text-sm text-gray-600 mt-1">
                                {p.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 次のステップ表示 */}
                    {order.status !== 'completed' && (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          📌 次のステップ
                        </p>
                        <p className="text-sm text-blue-700">
                          {order.status === 'ordered' &&
                            'オークションでの入札を開始します'}
                          {order.status === 'auction_processing' &&
                            '落札・計算書受領・代金支払いを実行します'}
                          {order.status === 'purchased' &&
                            '納品書の確認をお願いします'}
                          {order.status === 'invoiced' &&
                            '請求書をご確認ください'}
                          {order.status === 'payment_received' &&
                            '手続きの完了間近です'}
                        </p>
                      </div>
                    )}
                  </>
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
                  <span className="text-gray-600">車両価格</span>
                  <span className="font-medium">
                    {formatCurrency(order.vehiclePrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">買手数料</span>
                  <span className="font-medium">
                    {formatCurrency(order.buyCommission)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">合計金額</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ステータス別の次ステップ */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-600 font-semibold mb-2">
                  進捗：
                  {order.status === 'completed'
                    ? 'すべての手続きが完了しました'
                    : `${Math.round((['ordered', 'auction_processing', 'purchased', 'invoiced', 'payment_received', 'completed'].indexOf(order.status) + 1) / 6 * 100)}%`}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${{
                          ordered: '17%',
                          auction_processing: '34%',
                          purchased: '51%',
                          invoiced: '68%',
                          payment_received: '85%',
                          completed: '100%',
                        }[order.status] || '0%'
                        }`,
                    }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}