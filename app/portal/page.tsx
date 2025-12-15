'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { mockOrders } from '@/data/orders';
import { BUY_ORDER_STATUS_LABELS, BUY_ORDER_STATUS_COLORS } from '@/constants/status';
import { User } from '@/types/auth';
import { mockUsers } from '@/data/users';

export default function PortalDashboardPage() {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    // セッションストレージからユーザー情報を取得
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      const fullUser = mockUsers.find((u) => u.email === userData.email);
      if (fullUser) {
        setUser(fullUser);
      }
    }
  }, []);

  // ログインユーザー（得意先）に関連する注文を取得
  const userOrders = user?.clientId
    ? mockOrders.filter((o) => o.clientId === user.clientId)
    : [];

  // ステータス別集計
  const statusCounts = userOrders.reduce(
    (acc, order) => {
      acc[order.status as any] = (acc[order.status as any] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // 最近の注文（最新5件）
  const recentOrders = userOrders.slice(0, 5);

  return (
    <div>
      <PageHeader
        title="ポータルダッシュボード"
        subtitle="あなたの注文状況と最新情報"
      />

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">合計注文数</p>
            <p className="text-3xl font-bold text-gray-900">{userOrders.length}</p>
            <p className="text-xs text-gray-500 mt-2">すべての注文</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">合計金額</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0))}
            </p>
            <p className="text-xs text-gray-500 mt-2">全ステータス合計</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">進行中</p>
            <p className="text-3xl font-bold text-blue-600">
              {userOrders.filter((o) =>
                ['ordered', 'auction_processing', 'purchased'].includes(o.status),
              ).length}
            </p>
            <p className="text-xs text-gray-500 mt-2">処理待ち</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ステータス別集計 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">注文状況</h2>
            </CardHeader>
            <CardBody>
              {Object.keys(statusCounts).length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">注文がありません</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(statusCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {BUY_ORDER_STATUS_LABELS[status as any]}
                        </span>
                        <Badge variant={BUY_ORDER_STATUS_COLORS[status as any]}>
                          {count}件
                        </Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* クイックリンク */}
          <Card className="mt-4">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">メニュー</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                <Link href="/portal/orders">
                  <Button variant="ghost" fullWidth className="justify-start">
                    📋 注文管理
                  </Button>
                </Link>
                <Link href="/portal/deliveries">
                  <Button variant="ghost" fullWidth className="justify-start">
                    📄 納品・検収
                  </Button>
                </Link>
                <Link href="/portal/invoices">
                  <Button variant="ghost" fullWidth className="justify-start">
                    💰 請求書
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 最近の注文 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">最近の注文</h2>
                <Link
                  href="/portal/orders"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  全件表示 →
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              {recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">注文がありません</p>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/portal/orders/${order.id}`}
                      className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.orderDate)}
                          </p>
                        </div>
                        <Badge
                          variant={BUY_ORDER_STATUS_COLORS[order.status as any]}
                        >
                          {BUY_ORDER_STATUS_LABELS[order.status as any]}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          金額: {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}