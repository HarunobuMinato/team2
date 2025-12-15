'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { InvoiceTable } from '@/components/tables/invoice-table';
import { mockInvoices } from '@/data/invoices';
import { Invoice } from '@/types/invoice';

export default function InvoiceListPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string>('');

  // フィルタリングと検索
  React.useEffect(() => {
    let filtered = mockInvoices;

    // ステータスフィルタ
    if (filterStatus) {
      filtered = filtered.filter((i) => i.status === filterStatus);
    }

    // 検索キーワード（請求書番号）
    if (searchTerm) {
      filtered = filtered.filter((i) =>
        i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setInvoices(filtered);
  }, [searchTerm, filterStatus]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
  };

  // ステータスオプション
  const statusOptions = [
    { value: 'draft', label: '下書き' },
    { value: 'issued', label: '発行済み' },
    { value: 'partial', label: '部分支払' },
    { value: 'paid', label: '支払済み' },
    { value: 'overdue', label: '期限切れ' },
  ];

  // 集計情報
  const totalAmount = mockInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const paidAmount = mockInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const unpaidAmount = totalAmount - paidAmount;

  return (
    <div>
      <PageHeader
        title="請求書管理"
        subtitle="発行した請求書を管理"
        actions={
          <Link href="/main/invoices/new">
            <Button variant="primary">請求書発行</Button>
          </Link>
        }
      />

      {/* 集計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">請求合計</p>
            <p className="text-2xl font-bold text-gray-900">
              ¥{totalAmount.toLocaleString('ja-JP')}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">支払済み</p>
            <p className="text-2xl font-bold text-green-600">
              ¥{paidAmount.toLocaleString('ja-JP')}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">未払い</p>
            <p className="text-2xl font-bold text-orange-600">
              ¥{unpaidAmount.toLocaleString('ja-JP')}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* フィルタセクション */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">検索・フィルタ</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input
              placeholder="請求書番号で検索"
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
            検索結果: <span className="font-semibold">{invoices.length}</span>件
          </p>
        </CardBody>
      </Card>

      {/* 請求書テーブル */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">請求書データ</h2>
        </CardHeader>
        <CardBody className="p-0">
          <InvoiceTable invoices={invoices} />
        </CardBody>
      </Card>
    </div>
  );
}