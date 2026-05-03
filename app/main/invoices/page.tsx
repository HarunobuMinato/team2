'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { mockInvoices } from '@/data/invoices';
import { mockOrders } from '@/data/orders';
import { mockClients } from '@/data/clients';
import { formatCurrency, formatDateJP } from '@/lib/utils';

interface InvoiceWithRelations {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  totalAmount: number;
  paidAmount: number;
  status: string;
  orderNumber?: string;
  clientName?: string;
}

export default function InvoiceListPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  // 請求書と関連データを結合
  const enrichedInvoices: InvoiceWithRelations[] = mockInvoices.map(
    (invoice) => {
      const order = mockOrders.find((o) => o.id === invoice.orderId);
      const client = order
        ? mockClients.find((c) => c.id === order.clientId)
        : mockClients.find((c) => c.id === invoice.clientId);

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        status: invoice.status,
        orderNumber: order?.orderNumber,
        clientName: client?.name,
      };
    }
  );

  // フィルタリング
  const filteredInvoices = enrichedInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      invoice.clientName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ステータス色の定義
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      issued: 'bg-blue-100 text-blue-800',
      partial: 'bg-amber-100 text-amber-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      draft: '下書き',
      issued: '発行済み',
      partial: '部分支払',
      paid: '支払済み',
      overdue: '期限切れ',
    };
    return labels[status] || status;
  };

  // 集計情報
  const totalAmount = mockInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const paidAmount = mockInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const unpaidAmount = totalAmount - paidAmount;

  return (
    <div>
      <PageHeader
        title="請求書管理"
        subtitle="発行した請求書を管理、複数納品書から一括請求を作成"
        actions={
          <Link href="/main/invoices/new">
            <Button variant="primary">新規請求書作成</Button>
          </Link>
        }
      />

      {/* 集計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">請求合計</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              全{mockInvoices.length}件の合計
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">支払済み</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(paidAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round((paidAmount / totalAmount) * 100)}% 完了
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">未払い</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(unpaidAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round((unpaidAmount / totalAmount) * 100)}% 未済
            </p>
          </CardBody>
        </Card>
      </div>

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
                placeholder="請求書番号、顧客名で検索"
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
                <option value="partial">部分支払</option>
                <option value="paid">支払済み</option>
                <option value="overdue">期限切れ</option>
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

      {/* 請求書テーブル */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              請求書一覧
            </h2>
            <p className="text-sm text-gray-500">
              全{filteredInvoices.length}件
            </p>
          </div>
        </CardHeader>
        <CardBody>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">請求書が見つかりません</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      請求書番号
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      顧客名
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      請求日
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      期日
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      請求金額
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      支払済み
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
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Link
                          href={`/main/invoices/${invoice.id}`}
                          className="font-medium text-blue-600 hover:text-blue-700"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {invoice.clientName || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDateJP(invoice.invoiceDate)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDateJP(invoice.dueDate)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(invoice.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-green-600">
                        {formatCurrency(invoice.paidAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={getStatusColor(invoice.status)}>
                          {getStatusLabel(invoice.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link href={`/main/invoices/${invoice.id}`}>
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