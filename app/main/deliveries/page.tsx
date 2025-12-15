'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { DeliveryTable } from '@/components/tables/delivery-table';
import { mockDeliveries } from '@/data/deliveries';
import { Delivery } from '@/types/delivery';

export default function DeliveryListPage() {
  const [deliveries, setDeliveries] = React.useState<Delivery[]>(mockDeliveries);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string>('');

  // フィルタリングと検索
  React.useEffect(() => {
    let filtered = mockDeliveries;

    // ステータスフィルタ
    if (filterStatus) {
      filtered = filtered.filter((d) => d.status === filterStatus);
    }

    // 検索キーワード（納品書番号）
    if (searchTerm) {
      filtered = filtered.filter((d) =>
        d.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setDeliveries(filtered);
  }, [searchTerm, filterStatus]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
  };

  // ステータスオプション
  const statusOptions = [
    { value: 'draft', label: '下書き' },
    { value: 'issued', label: '発行済み' },
    { value: 'received', label: '受領済み' },
    { value: 'inspected', label: '検収済み' },
    { value: 'completed', label: '完了' },
  ];

  return (
    <div>
      <PageHeader
        title="納品書一覧"
        subtitle="発行した納品書を管理"
        actions={
          <Link href="/main/deliveries/new">
            <Button variant="primary">納品書作成</Button>
          </Link>
        }
      />

      {/* フィルタセクション */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">検索・フィルタ</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input
              placeholder="納品書番号で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select
              options={statusOptions}
              placeholder="ステータス"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
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
            検索結果: <span className="font-semibold">{deliveries.length}</span>件
          </p>
        </CardBody>
      </Card>

      {/* 納品書テーブル */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">納品書データ</h2>
        </CardHeader>
        <CardBody className="p-0">
          <DeliveryTable deliveries={deliveries} />
        </CardBody>
      </Card>
    </div>
  );
}