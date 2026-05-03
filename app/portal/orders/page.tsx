'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BUY_ORDER_STATUS_LABELS,
  BUY_ORDER_STATUS_COLORS,
} from '@/constants/status';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Order {
  id: number;
  order_number: string;
  order_type: 'buy' | 'sell' | 'mediation';
  status: string;
  order_date: string;
  desired_delivery_date: string | null;
  vehicle_count: number;
  total_amount?: number;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  client_id: number;
}

export default function PortalOrderListPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ユーザー情報を取得
  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    console.log('Retrieved user from sessionStorage:', userStr);
    if (userStr) {
      try {
        const userData = JSON.parse(userStr) as User;
        setUser(userData);
      } catch (e) {
        console.error('Failed to parse user data:', e);
        setError('ユーザー情報の取得に失敗しました');
      }
    } else {
      setError('ログインしてください');
    }
  }, []);

  // 顧客の受注を取得
  useEffect(() => {
    const fetchOrders = async () => {
      console.log('Fetching orders for client_id:', user?.client_id);
      if (!user?.client_id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/orders?client_id=${user.client_id}&limit=50`
        );
        console.log('Fetch /api/orders response:', response);

        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          setOrders(data.data);
        } else {
          setError('受注データの取得に失敗しました');
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError(
          err instanceof Error ? err.message : '受注一覧の取得に失敗しました'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.client_id]);

  // 確認待ちの注文を分離
  const pendingOrders = orders.filter((o) => o.status === 'order_pending');
  const otherOrders = orders.filter((o) => o.status !== 'order_pending');

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">読み込み中...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="注文一覧"
        subtitle="あなたの注文を確認"
      />

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardBody>
            <p className="text-red-700">❌ {error}</p>
          </CardBody>
        </Card>
      )}

      {orders.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">注文がありません</p>
            <p className="text-gray-400 text-sm">
              新しい注文はここに表示されます
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* 確認待ちの注文セクション */}
          {pendingOrders.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
                <span className="text-2xl mr-2">🔔</span>
                確認待ちの注文（{pendingOrders.length}件）
              </h2>
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <Link key={order.id} href={`/portal/orders/${order.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-yellow-300 bg-yellow-50">
                      <CardBody>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-lg font-semibold text-gray-900">
                              {order.order_number}
                            </p>
                            <p className="text-sm text-gray-500">
                              受注日: {formatDate(order.order_date)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                BUY_ORDER_STATUS_COLORS[order.status as any]
                              }
                            >
                              {BUY_ORDER_STATUS_LABELS[order.status as any]}
                            </Badge>
                            <span className="text-2xl animate-pulse">➡️</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-yellow-200">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">納期</p>
                            <p className="text-sm font-medium text-gray-900">
                              {order.desired_delivery_date
                                ? formatDate(order.desired_delivery_date)
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">台数</p>
                            <p className="text-sm font-medium text-gray-900">
                              {order.vehicle_count}台
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">種別</p>
                            <p className="text-sm font-medium text-gray-900">
                              {order.order_type === 'buy' ? '買い注文' : order.order_type === 'sell' ? '売り注文' : '仲介'}
                            </p>
                          </div>
                          <div className="text-right">
                            <Button
                              size="sm"
                              className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            >
                              確認する →
                            </Button>
                          </div>
                        </div>

                        {/* アラート */}
                        <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
                          <p className="font-semibold mb-1">
                            ⚠️ アクション必要
                          </p>
                          <p>
                            この注文を確認すると、当社がオークション入札を開始します。内容をよくご確認の上、「確認する」ボタンをクリックしてください。
                          </p>
                        </div>
                      </CardBody>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* その他の注文セクション */}
          {otherOrders.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                その他の注文（{otherOrders.length}件）
              </h2>
              <div className="space-y-4">
                {otherOrders.map((order) => (
                  <Link key={order.id} href={`/portal/orders/${order.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardBody>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-lg font-semibold text-gray-900">
                              {order.order_number}
                            </p>
                            <p className="text-sm text-gray-500">
                              受注日: {formatDate(order.order_date)}
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

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">納期</p>
                            <p className="text-sm font-medium text-gray-900">
                              {order.desired_delivery_date
                                ? formatDate(order.desired_delivery_date)
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">台数</p>
                            <p className="text-sm font-medium text-gray-900">
                              {order.vehicle_count}台
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">進捗</p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${
                                    {
                                      order_pending: '0%',
                                      ordered: '20%',
                                      auction_processing: '40%',
                                      purchased: '60%',
                                      invoiced: '80%',
                                      payment_received: '90%',
                                      completed: '100%',
                                    }[order.status as string] || '0%'
                                  }`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <Button variant="ghost" size="sm" className="ml-auto">
                              詳細 →
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}