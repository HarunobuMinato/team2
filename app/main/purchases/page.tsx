'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { mockPurchases } from '@/data/purchases';
import { mockOrders } from '@/data/orders';
import { mockClients } from '@/data/clients';
import { formatCurrency, formatDateJP } from '@/lib/utils';

interface PurchaseWithRelations {
  id: string;
  purchaseNumber: string;
  auctionDate: Date;
  vehicleName: string;
  totalPurchaseAmount: number;
  status: string;
  paymentStatus: string;
  clientName?: string;
  orderNumber?: string;
}

export default function PurchaseListPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  // 仕入れ情報と関連データを結合
  const enrichedPurchases: PurchaseWithRelations[] = mockPurchases.map(
    (purchase) => {
      const order = mockOrders.find((o) => o.id === purchase.orderId);
      const client = order
        ? mockClients.find((c) => c.id === order.clientId)
        : null;

      return {
        id: purchase.id,
        purchaseNumber: purchase.purchaseNumber,
        auctionDate: purchase.auctionDate,
        vehicleName: purchase.vehicleName,
        totalPurchaseAmount: purchase.totalPurchaseAmount,
        status: purchase.status,
        paymentStatus: purchase.paymentStatus,
        clientName: client?.name,
        orderNumber: order?.orderNumber,
      };
    }
  );

  // フィルタリング
  const filteredPurchases = enrichedPurchases.filter((purchase) => {
    const matchesSearch =
      purchase.purchaseNumber.includes(searchTerm) ||
      purchase.vehicleName.includes(searchTerm) ||
      (purchase.clientName?.includes(searchTerm) ?? false);

    const matchesStatus =
      statusFilter === 'all' || purchase.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ステータス色の定義
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      draft: 'gray',
      confirmed: 'blue',
      paid: 'green',
      completed: 'gray',
    };
    return colors[status] || 'gray';
  };

  const getPaymentStatusColor = (status: string): string => {
    return status === 'paid' ? 'green' : 'orange';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      draft: '下書き',
      confirmed: '確認済み',
      paid: '支払済み',
      completed: '完了',
    };
    return labels[status] || status;
  };

  const getPaymentStatusLabel = (status: string): string => {
    return status === 'paid' ? '支払済み' : '未支払い';
  };

  return (
    <div>
      <PageHeader
        title="仕入れ一覧"
        subtitle="オークション計算書から登録した仕入れ情報を確認"
        actions={
          <Link href="/main/purchases/new">
            <Button variant="primary">新規仕入れ登録</Button>
          </Link>
        }
      />

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
                placeholder="仕入れ番号、車種名、顧客名で検索"
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
                <option value="paid">支払済み</option>
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

      {/* 仕入れテーブル */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              仕入れ情報一覧
            </h2>
            <p className="text-sm text-gray-500">
              全{filteredPurchases.length}件
            </p>
          </div>
        </CardHeader>
        <CardBody>
          {filteredPurchases.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">仕入れが見つかりません</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      仕入れ番号
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      車種名
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      顧客名
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      オークション日
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      金額
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      ステータス
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      支払い
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
                      <td className="py-3 px-4">
                        <Link
                          href={`/main/purchases/${purchase.id}/confirm`}
                          className="font-medium text-blue-600 hover:text-blue-700"
                        >
                          {purchase.purchaseNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {purchase.vehicleName}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {purchase.clientName || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDateJP(purchase.auctionDate)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(purchase.totalPurchaseAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={getStatusColor(purchase.status)}>
                          {getStatusLabel(purchase.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={getPaymentStatusColor(purchase.paymentStatus)}
                        >
                          {getPaymentStatusLabel(purchase.paymentStatus)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link href={`/main/purchases/${purchase.id}/confirm`}>
                          <Button type="button" variant="secondary" size="sm">
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