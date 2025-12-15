'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Button } from '@/components/ui/button';
import { mockPaymentNotices } from '@/data/payments';
import { mockUsers } from '@/data/users';
import { formatCurrency, formatDate } from '@/lib/utils';
import { User } from '@/types/auth';

export default function PortalPaymentNoticeListPage() {
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

  // ログインユーザー（得意先）に関連する支払通知書を取得
  const userNotices = user?.clientId
    ? mockPaymentNotices.filter((n) => n.clientId === user.clientId)
    : [];

  return (
    <div>
      <PageHeader
        title="支払通知書"
        subtitle="25日締めの支払通知書を確認"
      />

      {userNotices.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">支払通知書がありません</p>
            <p className="text-gray-400 text-sm">
              通知書はここに表示されます
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {userNotices.map((notice) => (
            <Link key={notice.id} href={`/portal/portal/payment-notices/${notice.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardBody>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {notice.noticeNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        発行日: {formatDate(notice.issuedDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(notice.grandTotal)}
                      </p>
                      <p className="text-xs text-gray-600">合計金額</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">請求件数</p>
                      <p className="text-sm font-medium text-gray-900">
                        {notice.invoiceCount}件
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">期日</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(notice.dueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Button variant="ghost" size="sm">
                        詳細 →
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}