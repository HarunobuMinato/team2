'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { mockPaymentNotices } from '@/data/payments';
import { mockInvoices } from '@/data/invoices';
import { formatCurrency, formatDateJP } from '@/lib/utils';

export default function PortalPaymentNoticeDetailPage() {
  const params = useParams();
  const noticeId = params.id as string;

  const notice = mockPaymentNotices.find((n) => n.id === noticeId);
  const relatedInvoices = notice
    ? mockInvoices.filter((inv) => inv.clientId === notice.clientId)
    : [];

  if (!notice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">支払通知書が見つかりません</p>
        <Link href="/portal/payment-notices">
          <Button>支払通知書一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="支払通知書詳細"
        subtitle={notice.noticeNumber}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary">印刷</Button>
            <Link href="/portal/payment-notices">
              <Button variant="secondary">戻る</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 基本情報 */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                支払通知書情報
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">通知書番号</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {notice.noticeNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">発行日</p>
                  <p className="text-base text-gray-900">
                    {formatDateJP(notice.issuedDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">期日</p>
                  <p className="text-base text-gray-900">
                    {formatDateJP(notice.dueDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">請求件数</p>
                  <p className="text-base font-medium text-gray-900">
                    {notice.invoiceCount}件
                  </p>
                </div>
              </div>

              {/* 包含される請求書 */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  この通知に含まれる請求書
                </h3>
                <div className="space-y-2">
                  {relatedInvoices.slice(0, notice.invoiceCount).map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {inv.invoiceNumber}
                        </p>
                        <p className="text-xs text-gray-600">
                          期日: {formatDateJP(inv.dueDate)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(inv.totalAmount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 振込先情報 */}
          {notice.bankAccount && (
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
                      {notice.bankAccount.bankName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">支店</span>
                    <span className="font-medium">
                      {notice.bankAccount.branchName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">口座種別</span>
                    <span className="font-medium">
                      {notice.bankAccount.accountType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">口座番号</span>
                    <span className="font-medium">
                      {notice.bankAccount.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">名義</span>
                    <span className="font-medium">
                      {notice.bankAccount.accountHolder}
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
                  <span className="text-gray-600">請求額</span>
                  <span className="font-medium">
                    {formatCurrency(notice.totalAmount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">消費税（10%）</span>
                  <span className="font-medium">
                    {formatCurrency(notice.totalTax)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">合計金額</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(notice.grandTotal)}
                    </span>
                  </div>
                </div>

                {/* 支払期限 */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    📌 支払期限
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatDateJP(notice.dueDate)}
                  </p>
                </div>

                <Button variant="primary" fullWidth>
                  振込内容を確認
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}