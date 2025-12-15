'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { mockInvoices } from '@/data/invoices';
import { mockPayments } from '@/data/payments';
import { mockClients } from '@/data/clients';
import {
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
} from '@/constants/status';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PaymentMatchingPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedInvoices, setSelectedInvoices] = React.useState<Set<string>>(
    new Set(),
  );

  // 未支払いの請求書を取得
  const unpaidInvoices = mockInvoices.filter(
    (inv) =>
      inv.paidAmount < inv.totalAmount &&
      (searchTerm === '' ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const toggleInvoice = (invoiceId: string) => {
    const newSelected = new Set(selectedInvoices);
    if (newSelected.has(invoiceId)) {
      newSelected.delete(invoiceId);
    } else {
      newSelected.add(invoiceId);
    }
    setSelectedInvoices(newSelected);
  };

  // 選択した請求書の合計
  const selectedTotal = mockInvoices
    .filter((inv) => selectedInvoices.has(inv.id))
    .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

  return (
    <div>
      <PageHeader
        title="入金消込"
        subtitle="複数の請求書にまとめて入金を充当"
        actions={
          <Link href="/invoices">
            <Button variant="secondary">戻る</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 請求書一覧 */}
        <div className="lg:col-span-3">
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">未払い請求書</h2>
            </CardHeader>
            <CardBody>
              <Input
                placeholder="請求書番号で検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />

              {unpaidInvoices.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {searchTerm === ''
                    ? '未払い請求書がありません'
                    : '検索結果がありません'}
                </p>
              ) : (
                <div className="space-y-2">
                  {unpaidInvoices.map((invoice) => {
                    const client = mockClients.find(
                      (c) => c.id === invoice.clientId,
                    );
                    const unpaidAmount =
                      invoice.totalAmount - invoice.paidAmount;
                    const isSelected = selectedInvoices.has(invoice.id);

                    return (
                      <div
                        key={invoice.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => toggleInvoice(invoice.id)}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleInvoice(invoice.id)}
                            className="mt-1 w-4 h-4 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-gray-900">
                                {invoice.invoiceNumber}
                              </p>
                              <Badge
                                variant={
                                  INVOICE_STATUS_COLORS[invoice.status]
                                }
                              >
                                {INVOICE_STATUS_LABELS[invoice.status]}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {client?.name} | 期日:{' '}
                              {formatDate(invoice.dueDate)}
                            </p>
                            <div className="mt-2 flex items-center justify-between text-sm">
                              <div>
                                <span className="text-gray-600">未払い: </span>
                                <span className="font-semibold text-orange-600">
                                  {formatCurrency(unpaidAmount)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">支払済み: </span>
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(invoice.paidAmount)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* 集計パネル */}
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">選択情報</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">選択件数</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedInvoices.size}件
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 mb-1">未払い合計</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(selectedTotal)}
                  </p>
                </div>

                {selectedInvoices.size > 0 && (
                  <>
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <p className="text-sm text-gray-600 font-semibold">
                        選択した請求書
                      </p>
                      <ul className="space-y-1 text-sm">
                        {mockInvoices
                          .filter((inv) => selectedInvoices.has(inv.id))
                          .map((inv) => (
                            <li
                              key={inv.id}
                              className="flex justify-between text-gray-700"
                            >
                              <span>{inv.invoiceNumber}</span>
                              <span className="font-medium">
                                {formatCurrency(
                                  inv.totalAmount - inv.paidAmount,
                                )}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>

                    <Button variant="primary" fullWidth>
                      まとめて消込
                    </Button>
                  </>
                )}

                {selectedInvoices.size === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    請求書を選択してください
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}