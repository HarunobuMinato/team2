'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { mockOrders } from '@/data/orders';
import { mockPurchaseRecords } from '@/data/purchase-records';
import { mockClients } from '@/data/clients';
import { mockShipments } from '@/data/shipments';
import { mockDesiredVehicles } from '@/data/desired-vehicles';
import {
  BUY_ORDER_STATUS_LABELS,
  BUY_ORDER_STATUS_COLORS,
  SHIPMENT_STATUS_LABELS,
  SHIPMENT_STATUS_COLORS,
} from '@/constants/status';
import { formatCurrency, formatDateJP } from '@/lib/utils';
import { Order } from '@/types/order';
import { PurchaseRecord } from '@/types/purchase-record';

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
  const recentOrders = buyOrders.sort((a, b) => 
    new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
  ).slice(0, 5);

  // 仕入実績統計
  const purchaseStats = {
    total: mockPurchaseRecords.length,
    pending: mockPurchaseRecords.filter((p) => p.status === 'pending').length,
    recorded: mockPurchaseRecords.filter((p) => p.status === 'recorded').length,
    completed: mockPurchaseRecords.filter((p) => p.status === 'completed').length,
    totalAmount: mockPurchaseRecords.reduce((sum, p) => sum + p.bidPrice, 0),
  };

  // 最近の仕入実績（最新3件）
  const recentPurchases = mockPurchaseRecords
    .sort((a, b) => new Date(b.auctionDate).getTime() - new Date(a.auctionDate).getTime())
    .slice(0, 3);

  // 出荷統計
  const shipmentStats = {
    total: mockShipments.length,
    draft: mockShipments.filter((s) => s.status === 'draft').length,
    confirmed: mockShipments.filter((s) => s.status === 'confirmed').length,
    inTransit: mockShipments.filter((s) => s.status === 'in_transit').length,
    delivered: mockShipments.filter((s) => s.status === 'delivered').length,
    completed: mockShipments.filter((s) => s.status === 'completed').length,
  };

  // 最近の出荷（最新3件）
  const recentShipments = mockShipments
    .sort((a, b) => new Date(b.shipmentDate).getTime() - new Date(a.shipmentDate).getTime())
    .slice(0, 3);

  // 希望車両の統計
  const desiredVehicleCount = mockDesiredVehicles.length;

  return (
    <div>
      <PageHeader
        title="ダッシュボード"
        subtitle="受注・仕入・出荷の概要"
        actions={
          <Link href="/main/orders/new/buy">
            <Button variant="primary">新規受注登録</Button>
          </Link>
        }
      />

      {/* サマリーカード行1：受注・仕入 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* 買い注文サマリー */}
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">合計受注数</p>
            <p className="text-3xl font-bold text-gray-900">{buyOrders.length}</p>
            <p className="text-xs text-gray-500 mt-2">買い注文（複数車両対応）</p>
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

        {/* 仕入実績サマリー */}
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">仕入実績件数</p>
            <p className="text-3xl font-bold text-blue-600">
              {purchaseStats.total}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {purchaseStats.pending}件未登録 / {purchaseStats.recorded}件登録済み
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">仕入実績合計金額</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(purchaseStats.totalAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-2">全仕入実績</p>
          </CardBody>
        </Card>
      </div>

      {/* サマリーカード行2：出荷・希望車両 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* 出荷サマリー */}
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">出荷件数</p>
            <p className="text-3xl font-bold text-green-600">
              {shipmentStats.total}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              配送中: {shipmentStats.inTransit}件
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">ステータス分布</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="bg-gray-100 text-gray-800">
                準備: {shipmentStats.draft + shipmentStats.confirmed}
              </Badge>
              <Badge variant="bg-green-100 text-green-800">
                完: {shipmentStats.completed}
              </Badge>
            </div>
          </CardBody>
        </Card>

        {/* 希望車両サマリー */}
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">希望車両数</p>
            <p className="text-3xl font-bold text-purple-600">
              {desiredVehicleCount}
            </p>
            <p className="text-xs text-gray-500 mt-2">登録済み希望仕様</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">仕入実績ステータス</p>
            <div className="flex flex-col gap-1 mt-2">
              <Badge variant="bg-indigo-100 text-indigo-800">
                未登録: {purchaseStats.pending}
              </Badge>
              <Badge variant="bg-blue-100 text-blue-800">
                登録済: {purchaseStats.recorded}
              </Badge>
            </div>
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
                <Link
                  href="/main/orders"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
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
                            {order.vehicleCount}台
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

      {/* 仕入実績セクション */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        {/* 仕入実績ステータス */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                仕入実績ステータス
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">未登録</span>
                  <Badge variant="bg-indigo-100 text-indigo-800">
                    {purchaseStats.pending}件
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">登録済み</span>
                  <Badge variant="bg-blue-100 text-blue-800">
                    {purchaseStats.recorded}件
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">完了</span>
                  <Badge variant="bg-gray-100 text-gray-800">
                    {purchaseStats.completed}件
                  </Badge>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  href="/main/vehicles/purchase"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  仕入実績一覧を見る →
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 最近の仕入実績 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  最近の仕入実績
                </h2>
                <Link
                  href="/main/vehicles/purchase"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  全件表示 →
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              {recentPurchases.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  仕入実績がありません
                </p>
              ) : (
                <div className="space-y-3">
                  {recentPurchases.map((purchase: PurchaseRecord) => {
                    const order = mockOrders.find(
                      (o) => o.id === purchase.orderId
                    );
                    const client = order
                      ? mockClients.find((c) => c.id === order.clientId)
                      : null;

                    return (
                      <Link
                        key={purchase.id}
                        href={`/main/vehicles/purchase/${purchase.id}`}
                        className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {purchase.vehicleName}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {client?.name || '-'} •{' '}
                              {formatDateJP(purchase.auctionDate)}
                            </p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                              {formatCurrency(purchase.bidPrice)}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant={
                                purchase.status === 'pending'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : purchase.status === 'recorded'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                              }
                            >
                              {purchase.status === 'pending'
                                ? '未登録'
                                : purchase.status === 'recorded'
                                  ? '登録済み'
                                  : '完了'}
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

      {/* 出荷セクション */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 出荷ステータス */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                出荷ステータス
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">下書き</span>
                  <Badge variant="bg-gray-100 text-gray-800">
                    {shipmentStats.draft}件
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">確認済み</span>
                  <Badge variant="bg-blue-100 text-blue-800">
                    {shipmentStats.confirmed}件
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">配送中</span>
                  <Badge variant="bg-amber-100 text-amber-800">
                    {shipmentStats.inTransit}件
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">配送完了</span>
                  <Badge variant="bg-green-100 text-green-800">
                    {shipmentStats.delivered}件
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">完了</span>
                  <Badge variant="bg-gray-400 text-gray-800">
                    {shipmentStats.completed}件
                  </Badge>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  href="/main/shipments"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  出荷一覧を見る →
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 最近の出荷 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  最近の出荷
                </h2>
                <Link
                  href="/main/shipments"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  全件表示 →
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              {recentShipments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  出荷がありません
                </p>
              ) : (
                <div className="space-y-3">
                  {recentShipments.map((shipment) => {
                    const client = mockClients.find(
                      (c) => c.id === shipment.clientId
                    );

                    return (
                      <Link
                        key={shipment.id}
                        href={`/main/shipments/${shipment.id}`}
                        className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {shipment.shipmentNumber}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {client?.name || '-'} •{' '}
                              {formatDateJP(shipment.shipmentDate)} •{' '}
                              {shipment.vehicleCount}台
                            </p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                              {formatCurrency(shipment.totalShipmentCost)}
                            </p>
                          </div>
                          <Badge
                            variant={
                              SHIPMENT_STATUS_COLORS[shipment.status as any]
                            }
                          >
                            {SHIPMENT_STATUS_LABELS[shipment.status as any]}
                          </Badge>
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