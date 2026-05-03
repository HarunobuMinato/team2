'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { mockInvoices } from '@/data/invoices';
import { mockClients } from '@/data/clients';
import { formatCurrency, formatDateJP } from '@/lib/utils';

interface PaymentWithRelations {
  id: string;
  invoiceNumber: string;
  clientName: string;
  invoiceDate: Date;
  dueDate: Date;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  isPending: boolean;
  isOverdue: boolean;
}

export default function PaymentListPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string>('all');

  // 請求書と顧客情報を結合
  const enrichedPayments: PaymentWithRelations[] = mockInvoices.map(
    (invoice) => {
      const client = mockClients.find((c) => c.id === invoice.clientId);
      const remainingAmount = invoice.totalAmount - invoice.paidAmount;
      const isOverdue =
        new Date(invoice.dueDate) < new Date() && remainingAmount > 0;
      const isPending = invoice.status === 'issued' || invoice.status === 'partial';

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientName: client?.name || '不明',
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        remainingAmount,
        status: invoice.status,
        isPending,
        isOverdue,
      };
    }
  );

  // フィルタリング
  const filteredPayments = enrichedPayments.filter((payment) => {
    const matchesSearch =
      payment.invoiceNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.clientName.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (filterStatus === 'pending') {
      matchesStatus = payment.isPending;
    } else if (filterStatus === 'paid') {
      matchesStatus = payment.status === 'paid';
    } else if (filterStatus === 'overdue') {
      matchesStatus = payment.isOverdue;
    }

    return matchesSearch && matchesStatus;
  });

  // 集計情報
  const totalAmount = mockInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const paidAmount = mockInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const unpaidAmount = totalAmount - paidAmount;
  const overdueAmount = enrichedPayments
    .filter((p) => p.isOverdue)
    .reduce((sum, p) => sum + p.remainingAmount, 0);

  return (
    <div>
      <PageHeader
        title="入金管理"
        subtitle="顧客の支払い状況を管理"
        actions={
          <Link href="/main/invoices">
            <Button variant="secondary">請求書管理へ</Button>
          </Link>
        }
      />

      {/* 集計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">請求合計</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-2">全{mockInvoices.length}件</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">支払済み</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(paidAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round((paidAmount / totalAmount) * 100)}%
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
              {filteredPayments.filter((p) => p.isPending).length}件
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">期限超過</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(overdueAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {enrichedPayments.filter((p) => p.isOverdue).length}件
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="pending">未払い</option>
                <option value="paid">支払済み</option>
                <option value="overdue">期限超過</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
              >
                リセット
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 入金管理テーブル */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              入金一覧
            </h2>
            <p className="text-sm text-gray-500">全{filteredPayments.length}件</p>
          </div>
        </CardHeader>
        <CardBody>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">該当する請求書がありません</p>
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
                      期日
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      請求金額
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      支払済み
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      未払い
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
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Link
                          href={`/main/payments/${payment.id}`}
                          className="font-medium text-blue-600 hover:text-blue-700"
                        >
                          {payment.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {payment.clientName}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDateJP(payment.dueDate)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(payment.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-green-600">
                        {formatCurrency(payment.paidAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-orange-600">
                        {formatCurrency(payment.remainingAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center">
                          {payment.isOverdue ? (
                            <Badge variant="bg-red-100 text-red-800">
                              期限超過
                            </Badge>
                          ) : payment.status === 'paid' ? (
                            <Badge variant="bg-green-100 text-green-800">
                              支払済み
                            </Badge>
                          ) : payment.status === 'partial' ? (
                            <Badge variant="bg-amber-100 text-amber-800">
                              部分支払
                            </Badge>
                          ) : (
                            <Badge variant="bg-blue-100 text-blue-800">
                              未払い
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link href={`/main/payments/${payment.id}`}>
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