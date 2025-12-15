'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { mockInvoices } from '@/data/invoices';
import {
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
} from '@/constants/status';
import { formatCurrency, formatDateJP } from '@/lib/utils';

export default function PortalInvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const invoice = mockInvoices.find((i) => i.id === invoiceId);

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">請求書が見つかりません</p>
        <Link href="/portal/portal/invoices">
          <Button>請求書一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  const remainingAmount = invoice.totalAmount - invoice.paidAmount;
  const isPaid = invoice.paidAmount === invoice.totalAmount;

  return (
    <div>
      <PageHeader
        title="請求書詳細"
        subtitle={invoice.invoiceNumber}
        actions={
          <Link href="/portal/portal/invoices">
            <Button variant="secondary">戻る</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 基本情報 */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  請求書情報
                </h2>
                <Badge variant={INVOICE_STATUS_COLORS[invoice.status]}>
                  {INVOICE_STATUS_LABELS[invoice.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">請求書番号</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {invoice.invoiceNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">請求日</p>
                  <p className="text-base text-gray-900">
                    {formatDateJP(invoice.invoiceDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">期日</p>
                  <p className="text-base text-gray-900">
                    {formatDateJP(invoice.dueDate)}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 振込先情報 */}
          {invoice.bankAccount && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  振込先情報
                </h2>
              </CardHeader>
              <CardBody>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">銀行</span>
                    <span className="font-medium">
                      {invoice.bankAccount.bankName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">支店</span>
                    <span className="font-medium">
                      {invoice.bankAccount.branchName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">口座種別</span>
                    <span className="font-medium">
                      {invoice.bankAccount.accountType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">口座番号</span>
                    <span className="font-medium">
                      {invoice.bankAccount.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">名義</span>
                    <span className="font-medium">
                      {invoice.bankAccount.accountHolder}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* 金額情報 */}
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">金額詳細</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">請求金額</span>
                  <span className="font-medium">
                    {formatCurrency(invoice.amount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">消費税（10%）</span>
                  <span className="font-medium">
                    {formatCurrency(invoice.tax)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold text-gray-900">
                      請求合計
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(invoice.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-medium text-gray-900">支払状況</p>
                  <div className="flex justify-between">
                    <span className="text-gray-600">支払済み</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(invoice.paidAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">未払い</span>
                    <span
                      className={`font-medium ${
                        remainingAmount > 0
                          ? 'text-orange-600'
                          : 'text-green-600'
                      }`}
                    >
                      {formatCurrency(remainingAmount)}
                    </span>
                  </div>
                </div>

                {/* 進捗バー */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">支払率</span>
                    <span className="font-medium">
                      {Math.round(
                        (invoice.paidAmount / invoice.totalAmount) * 100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isPaid ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                      style={{
                        width: `${
                          (invoice.paidAmount / invoice.totalAmount) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* ステータスメッセージ */}
                {isPaid && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    ✓ お支払いが完了しました
                  </div>
                )}

                {remainingAmount > 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
                    📌 未払い金額: {formatCurrency(remainingAmount)}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}