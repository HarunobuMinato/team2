'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateJP } from '@/lib/utils';

interface PurchaseRecord {
  id: number;
  vehicle_name: string;
  auction_date: string;
  bid_price: number;
  status: string;
  order_id: number;
  order_number?: string;
  client_name?: string;
}

export default function PurchaseRecordListPage() {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 仕入実績を取得
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/purchase-records');
        const data = await response.json();

        console.log('📋 仕入実績一覧データ:', data);

        if (data.success) {
          // 関連データを取得して結合
          const enrichedPurchases = await Promise.all(
            (data.data || []).map(async (purchase: any) => {
              try {
                // 受注情報を取得
                const orderRes = await fetch(`/api/orders/${purchase.order_id}`);
                const orderData = await orderRes.json();

                // クライアント情報を取得
                let clientName = '';
                if (orderData.success && orderData.data.client_id) {
                  const clientRes = await fetch(`/api/clients/${orderData.data.client_id}`);
                  const clientData = await clientRes.json();
                  if (clientData.success) {
                    clientName = clientData.data.name;
                  }
                }

                return {
                  ...purchase,
                  order_number: orderData.data?.order_number,
                  client_name: clientName,
                };
              } catch (err) {
                console.warn('⚠️ 関連データ取得エラー:', err);
                return purchase;
              }
            })
          );

          setPurchases(enrichedPurchases);
        } else {
          setError(data.error || '仕入実績の取得に失敗しました');
        }
      } catch (err) {
        console.error('❌ 仕入実績取得エラー:', err);
        setError('仕入実績の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  // フィルタリング
  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.order_number?.includes(searchTerm) ||
      purchase.client_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || purchase.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ステータス色
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'bg-indigo-100 text-indigo-800',
      recorded: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: '未登録',
      recorded: '登録済み',
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
        title="仕入実績一覧"
        subtitle="オークションで落札した車両の実績情報"
        actions={
          <Link href="/main/vehicles/purchase/new">
            <Button variant="primary">新規仕入実績登録</Button>
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
                placeholder="車種名、顧客名、受注番号で検索"
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
                <option value="pending">未登録</option>
                <option value="recorded">登録済み</option>
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

      {/* 仕入実績テーブル */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              仕入実績一覧
            </h2>
            <p className="text-sm text-gray-500">
              全{filteredPurchases.length}件
            </p>
          </div>
        </CardHeader>
        <CardBody>
          {filteredPurchases.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">仕入実績が見つかりません</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      車種名
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      受注番号
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      顧客名
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      落札日
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      落札価格
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
                  {filteredPurchases.map((purchase) => (
                    <tr
                      key={purchase.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {purchase.vehicle_name}
                      </td>
                      <td className="py-3 px-4">
                        {purchase.order_number ? (
                          <Link
                            href={`/main/orders/${purchase.order_id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {purchase.order_number}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {purchase.client_name || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDateJP(purchase.auction_date)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(purchase.bid_price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={getStatusColor(purchase.status)}>
                          {getStatusLabel(purchase.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link href={`/main/purchase/${purchase.id}`}>
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