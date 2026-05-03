'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateJP } from '@/lib/utils';

interface Shipment {
  id: number;
  order_id: number;
  shipment_number: string;
  vehicle_count: number;
  shipment_date: string;
  transport_cost: number;
  status: string;
  order_number?: string;
  client_name?: string;
}

export default function ShipmentListPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 出荷一覧を取得
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('📋 出荷一覧データを取得中...');

        const response = await fetch('/api/shipments');
        const data = await response.json();

        console.log('📊 出荷一覧データ:', data);

        if (data.success) {
          // 関連データを取得して結合
          const enrichedShipments = await Promise.all(
            (data.data || []).map(async (shipment: any) => {
              try {
                // 受注情報を取得
                const orderRes = await fetch(`/api/orders/${shipment.order_id}`);
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
                  ...shipment,
                  order_number: orderData.data?.order_number,
                  client_name: clientName,
                };
              } catch (err) {
                console.warn('⚠️ 関連データ取得エラー:', err);
                return shipment;
              }
            })
          );

          setShipments(enrichedShipments);
          console.log('✅ 出荷一覧取得完了:', enrichedShipments.length, '件');
        } else {
          setError(data.error || '出荷一覧の取得に失敗しました');
        }
      } catch (err) {
        console.error('❌ 出荷一覧取得エラー:', err);
        setError('出荷一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  // フィルタリング
  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.shipment_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.client_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || shipment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ステータス色
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-amber-100 text-amber-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-gray-400 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      draft: '下書き',
      confirmed: '確認済み',
      in_transit: '配送中',
      delivered: '配送完了',
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
        title="出荷一覧"
        subtitle="出荷指示と陸送費用を管理"
        actions={
          <Link href="/main/shipments/new">
            <Button variant="primary">新規出荷登録</Button>
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
                placeholder="出荷番号、受注番号、顧客名で検索"
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
                <option value="confirmed">確認済み</option>
                <option value="in_transit">配送中</option>
                <option value="delivered">配送完了</option>
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

      {/* 出荷テーブル */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              出荷情報一覧
            </h2>
            <p className="text-sm text-gray-500">
              全{filteredShipments.length}件
            </p>
          </div>
        </CardHeader>
        <CardBody>
          {filteredShipments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">出荷が見つかりません</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      出荷番号
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
                      出荷日
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      陸送費用
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
                  {filteredShipments.map((shipment) => (
                    <tr
                      key={shipment.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Link
                          href={`/main/shipments/${shipment.id}`}
                          className="font-medium text-blue-600 hover:text-blue-700"
                        >
                          {shipment.shipment_number}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {shipment.order_number ? (
                          <Link
                            href={`/main/orders/${shipment.order_id}`}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {shipment.order_number}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {shipment.client_name || '-'}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-gray-900">
                        {shipment.vehicle_count}台
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDateJP(shipment.shipment_date)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(shipment.transport_cost)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={getStatusColor(shipment.status)}>
                          {getStatusLabel(shipment.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link href={`/main/shipments/${shipment.id}`}>
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