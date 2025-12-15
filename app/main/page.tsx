'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { mockOrders } from '@/data/orders';
import { mockPurchases } from '@/data/purchases';
import { mockClients } from '@/data/clients';
import {
  BUY_ORDER_STATUS_LABELS,
  BUY_ORDER_STATUS_COLORS,
} from '@/constants/status';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateJP } from '@/lib/utils';
import { Order } from '@/types/order';

export default function DashboardPage() {
  // 買い注文のみをフィルタリング
  const buyOrders = mockOrders.filter((order) => order.orderType === 'buy');

  // ステータス別集計
  const statusCounts = buyOrders.reduce(
    (acc, order) => {
      acc[order.status as any] = (acc[order.status as any] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // 最近の注文（最新5件）
  const recentOrders = buyOrders.slice(0, 5);

  // 仕入れ情報
  const purchaseStats = {
    total: mockPurchases.length,
    unpaid: mockPurchases.filter((p) => p.paymentStatus === 'unpaid').length,
    totalAmount: mockPurchases.reduce((sum, p) => sum + p.totalPurchaseAmount, 0),
  };

  // 最近の仕入れ（最新3件）
  const recentPurchases = mockPurchases.slice(0, 3);

  return (
    <div>
      <PageHeader
        title="ダッシュボード"
        subtitle="買い注文と仕入れの概要"
        actions={
          <Link href="/main/orders/new/buy">
            <Button variant="primary">新規受注登録</Button>
          </Link>
        }
      />

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* 買い注文サマリー */}
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">合計受注数</p>
            <p className="text-3xl font-bold text-gray-900">{buyOrders.length}</p>
            <p className="text-xs text-gray-500 mt-2">買い注文</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">受注合計金額</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                buyOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
              )}
            </p>
            <p className="text-xs text-gray-500 mt-2">全ステータス</p>
          </CardBody>
        </Card>

        {/* 仕入れサマリー */}
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">仕入れ件数</p>
            <p className="text-3xl font-bold text-blue-600">
              {purchaseStats.total}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {purchaseStats.unpaid}件未支払い
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">仕入れ合計金額</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(purchaseStats.totalAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-2">全仕入れ</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        {/* ステータス別集計 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                受注ステータス別
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {Object.entries(statusCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {BUY_ORDER_STATUS_LABELS[status as any] || status}
                      </span>
                      <Badge variant={BUY_ORDER_STATUS_COLORS[status as any]}>
                        {count}件
                      </Badge>
                    </div>
                  ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link href="/main/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  受注一覧を見る →
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 最近の受注 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  最近の受注
                </h2>
                <Link
                  href="/main/orders"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  全件表示 →
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              {recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">受注がありません</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order: Order) => (
                    <Link
                      key={order.id}
                      href={`/main/orders/${order.id}`}
                      className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {order.orderNumber}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDateJP(order.orderDate)} •{' '}
                            {formatCurrency(order.totalAmount)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            BUY_ORDER_STATUS_COLORS[order.status as any]
                          }
                        >
                          {BUY_ORDER_STATUS_LABELS[order.status as any]}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 仕入れセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 仕入れ支払いステータス */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                仕入れ支払い状況
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">未支払い</span>
                  <Badge variant="orange">{purchaseStats.unpaid}件</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">支払済み</span>
                  <Badge variant="green">
                    {purchaseStats.total - purchaseStats.unpaid}件
                  </Badge>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link href="/main/purchases" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  仕入れ一覧を見る →
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 最近の仕入れ */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  最近の仕入れ
                </h2>
                <Link
                  href="/main/purchases"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  全件表示 →
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              {recentPurchases.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  仕入れがありません
                </p>
              ) : (
                <div className="space-y-3">
                  {recentPurchases.map((purchase) => {
                    const order = mockOrders.find(
                      (o) => o.id === purchase.orderId
                    );
                    const client = order
                      ? mockClients.find((c) => c.id === order.clientId)
                      : null;

                    return (
                      <Link
                        key={purchase.id}
                        href={`/main/purchases/${purchase.id}/confirm`}
                        className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {purchase.vehicleName}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {purchase.purchaseNumber} •{' '}
                              {client?.name || '-'} •{' '}
                              {formatDateJP(purchase.auctionDate)}
                            </p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                              {formatCurrency(purchase.totalPurchaseAmount)}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
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
                            <Badge
                              variant={
                                purchase.paymentStatus === 'paid'
                                  ? 'green'
                                  : 'orange'
                              }
                            >
                              {purchase.paymentStatus === 'paid'
                                ? '支払済み'
                                : '未支払い'}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}