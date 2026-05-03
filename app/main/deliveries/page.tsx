'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateJP } from '@/lib/utils';

interface Delivery {
  id: number;
  order_id: number;
  delivery_number: string;
  vehicle_count: number;
  delivery_date: string;
  total_amount: number;
  status: string;
  order_number?: string;
  client_name?: string;
}

export default function DeliveryListPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 納品書一覧を取得
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('📋 納品書一覧データを取得中...');

        const response = await fetch('/api/deliveries');
        const data = await response.json();

        console.log('📊 納品書一覧データ:', data);

        if (data.success) {
          // 関連データを取得して結合
          const enrichedDeliveries = await Promise.all(
            (data.data || []).map(async (delivery: any) => {
              try {
                // 受注情報を取得
                const orderRes = await fetch(`/api/orders/${delivery.order_id}`);
                const orderData = await orderRes.json();

                // クライアント情報を取得
                let clientName = '';
                if (orderData.success && orderData.data.client_id) {
                  const clientRes = await fetch(
                    `/api/clients/${orderData.data.client_id}`
                  );
                  const clientData = await clientRes.json();
                  if (clientData.success) {
                    clientName = clientData.data.name;
                  }
                }

                return {
                  ...delivery,
                  order_number: orderData.data?.order_number,
                  client_name: clientName,
                };
              } catch (err) {
                console.warn('⚠️ 関連データ取得エラー:', err);
                return delivery;
              }
            })
          );

          setDeliveries(enrichedDeliveries);
          console.log('✅ 納品書一覧取得完了:', enrichedDeliveries.length, '件');
        } else {
          setError(data.error || '納品書一覧の取得に失敗しました');
        }
      } catch (err) {
        console.error('❌ 納品書一覧取得エラー:', err);
        setError('納品書一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  // フィルタリング
  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      delivery.delivery_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      delivery.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.client_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || delivery.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ステータス色
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      issued: 'bg-blue-100 text-blue-800',
      received: 'bg-green-100 text-green-800',
      inspected: 'bg-amber-100 text-amber-800',
      completed: 'bg-gray-400 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      draft: '下書き',
      issued: '発行済み',
      received: '受領済み',
      inspected: '検収済み',
      completed: '完了',
    };
    return labels[status] || status;
  };

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
        title="納品書一覧"
        subtitle="発行した納品書を管理"
        actions={
          <Link href="/main/deliveries/new">
            <Button variant="primary">新規納品書作成</Button>
          </Link>
        }
      />

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardBody>
            <p className="text-red-700">❌ {error}</p>
          </CardBody>
        </Card>
      )}

      {/* 検索・フィルタ */}
      <Card className="mb-6">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                検索
              </label>
              <input
                type="text"
                placeholder="納品書番号、受注番号、顧客名で検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="draft">下書き</option>
                <option value="issued">発行済み</option>
                <option value="received">受領済み</option>
                <option value="inspected">検収済み</option>
                <option value="completed">完了</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                リセット
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 納品書テーブル */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              納品書一覧
            </h2>
            <p className="text-sm text-gray-500">
              全{filteredDeliveries.length}件
            </p>
          </div>
        </CardHeader>
        <CardBody>
          {filteredDeliveries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">納品書が見つかりません</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      納品書番号
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      受注番号
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      顧客名
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      台数
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      納品日
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      金額
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      ステータス
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeliveries.map((delivery) => (
                    <tr
                      key={delivery.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Link
                          href={`/main/deliveries/${delivery.id}`}
                          className="font-medium text-blue-600 hover:text-blue-700"
                        >
                          {delivery.delivery_number}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {delivery.order_number ? (
                          <Link
                            href={`/main/orders/${delivery.order_id}`}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {delivery.order_number}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {delivery.client_name || '-'}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-gray-900">
                        {delivery.vehicle_count}台
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDateJP(delivery.delivery_date)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(delivery.total_amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={getStatusColor(delivery.status)}>
                          {getStatusLabel(delivery.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link href={`/main/deliveries/${delivery.id}`}>
                          <Button type="button" variant="ghost" size="sm">
                            詳細
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}