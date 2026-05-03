'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockInvoices } from '@/data/invoices';
import { mockUsers } from '@/data/users';
import {
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
} from '@/constants/status';
import { formatCurrency, formatDate, formatDateJP } from '@/lib/utils';
import { User } from '@/types/auth';

export default function PortalInvoiceListPage() {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      const fullUser = mockUsers.find((u) => u.email === userData.email);
      if (fullUser) {
        setUser(fullUser);
      }
    }
  }, []);

  // ログインユーザー（得意先）に関連する請求書を取得
  const userInvoices = user?.clientId
    ? mockInvoices.filter((i) => i.clientId === user.clientId)
    : [];

  // 未払い合計
  const unpaidTotal = userInvoices.reduce(
    (sum, i) => sum + (i.totalAmount - i.paidAmount),
    0,
  );

  // 支払い期限が切れた請求書の合計
  const overdueTotal = userInvoices
    .filter((i) => {
      const remaining = i.totalAmount - i.paidAmount;
      return new Date(i.dueDate) < new Date() && remaining > 0;
    })
    .reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);

  return (
    <div>
      <PageHeader
        title="請求書"
        subtitle="あなたの請求書を確認・支払い"
      />

      {/* サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">請求件数</p>
            <p className="text-2xl font-bold text-gray-900">
              {userInvoices.length}件
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">請求合計</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                userInvoices.reduce((sum, i) => sum + i.totalAmount, 0),
              )}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">未払い合計</p>
            <p className={`text-2xl font-bold ${overdueTotal > 0 ? 'text-red-600' : 'text-orange-600'}`}>
              {formatCurrency(unpaidTotal)}
            </p>
            {overdueTotal > 0 && (
              <p className="text-xs text-red-600 mt-1">
                期限超過: {formatCurrency(overdueTotal)}
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {userInvoices.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">請求書がありません</p>
            <p className="text-gray-400 text-sm">
              請求書はここに表示されます
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {userInvoices.map((invoice) => {
            const unpaidAmount = invoice.totalAmount - invoice.paidAmount;
            const isOverdue = new Date(invoice.dueDate) < new Date() && unpaidAmount > 0;

            return (
              <Card
                key={invoice.id}
                className={`hover:shadow-md transition-shadow ${
                  isOverdue ? 'border-l-4 border-red-600' : ''
                }`}
              >
                <CardBody>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {invoice.invoiceNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        請求日: {formatDate(invoice.invoiceDate)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant={INVOICE_STATUS_COLORS[invoice.status]}
                      >
                        {INVOICE_STATUS_LABELS[invoice.status]}
                      </Badge>
                      {isOverdue && (
                        <Badge variant="bg-red-100 text-red-800">
                          期限超過
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">期日</p>
                      <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatDateJP(invoice.dueDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">請求額</p>
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(invoice.totalAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">支払済み</p>
                      <p className="text-sm font-bold text-green-600">
                        {formatCurrency(invoice.paidAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">未払い</p>
                      <p className="text-sm font-bold text-orange-600">
                        {formatCurrency(unpaidAmount)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 justify-center">
                      {unpaidAmount > 0 ? (
                        <Link href={`/portal/invoices/${invoice.id}/payment`}>
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            className="text-xs"
                          >
                            💳 支払う
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          fullWidth
                          disabled
                          className="text-xs"
                        >
                          ✓ 支払済み
                        </Button>
                      )}
                      <Link href={`/portal/invoices/${invoice.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          fullWidth
                          className="text-xs"
                        >
                          詳細
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}