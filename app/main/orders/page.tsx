'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { OrderTable } from '@/components/tables/order-table';
import { mockOrders } from '@/data/orders';
import { mockUsers } from '@/data/users';
import { Order } from '@/types/order';

export default function OrderListPage() {
  const [orders, setOrders] = React.useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterOrderType, setFilterOrderType] = React.useState<string>('');
  const [filterStatus, setFilterStatus] = React.useState<string>('');
  const [filterSalesPerson, setFilterSalesPerson] = React.useState<string>('');

  // フィルタリングと検索
  React.useEffect(() => {
    let filtered = mockOrders;

    // 注文種別フィルタ
    if (filterOrderType) {
      filtered = filtered.filter((o) => o.orderType === filterOrderType);
    }

    // ステータスフィルタ
    if (filterStatus) {
      filtered = filtered.filter((o) => o.status === filterStatus);
    }

    // 営業担当者フィルタ
    if (filterSalesPerson) {
      filtered = filtered.filter((o) => o.salesPersonId === filterSalesPerson);
    }

    // 検索キーワード（受注番号）
    if (searchTerm) {
      filtered = filtered.filter((o) =>
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setOrders(filtered);
  }, [searchTerm, filterOrderType, filterStatus, filterSalesPerson]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterOrderType('');
    setFilterStatus('');
    setFilterSalesPerson('');
  };

  // 営業担当者オプション
  const salesPersonOptions = mockUsers
    .filter((u) => u.role === 'sales')
    .map((u) => ({
      value: u.id,
      label: u.name,
    }));

  // ステータスオプション（買い注文用）
  const statusOptions = [
    { value: 'ordered', label: '受注済み' },
    { value: 'auction_processing', label: 'オークション手続中' },
    { value: 'purchased', label: '仕入完了' },
    { value: 'invoiced', label: '請求済み' },
    { value: 'payment_received', label: '入金完了' },
    { value: 'completed', label: '完了' },
  ];

  // 注文種別オプション
  const orderTypeOptions = [
    { value: 'buy', label: '買い注文' },
    { value: 'sell', label: '売り注文' },
    { value: 'mediation', label: '仲介売買' },
  ];

  return (
    <div>
      <PageHeader
        title="受注一覧"
        subtitle="すべての受注を検索・管理"
        actions={
          <Link href="/orders/new/buy">
            <Button variant="primary">新規受注登録</Button>
          </Link>
        }
      />

      {/* フィルタセクション */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">検索・フィルタ</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <Input
              placeholder="受注番号で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select
              options={orderTypeOptions}
              placeholder="注文種別"
              value={filterOrderType}
              onChange={(e) => setFilterOrderType(e.target.value)}
            />

            <Select
              options={statusOptions}
              placeholder="ステータス"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            />

            <Select
              options={salesPersonOptions}
              placeholder="営業担当者"
              value={filterSalesPerson}
              onChange={(e) => setFilterSalesPerson(e.target.value)}
            />

            <Button
              variant="secondary"
              onClick={resetFilters}
              fullWidth
            >
              リセット
            </Button>
          </div>

          <p className="text-sm text-gray-600">
            検索結果: <span className="font-semibold">{orders.length}</span>件
          </p>
        </CardBody>
      </Card>

      {/* 受注テーブル */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">受注データ</h2>
        </CardHeader>
        <CardBody className="p-0">
          <OrderTable orders={orders} />
        </CardBody>
      </Card>
    </div>
  );
}