'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockOrders } from '@/data/orders';
import { mockUsers } from '@/data/users';
import {
  BUY_ORDER_STATUS_LABELS,
  BUY_ORDER_STATUS_COLORS,
} from '@/constants/status';
import { formatCurrency, formatDate } from '@/lib/utils';
import { User } from '@/types/auth';

export default function PortalOrderListPage() {
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

  // ログインユーザー（得意先）に関連する注文を取得
  const userOrders = user?.clientId
    ? mockOrders.filter((o) => o.clientId === user.clientId)
    : [];

  return (
    <div>
      <PageHeader
        title="注文一覧"
        subtitle="あなたの注文を確認"
      />

      {userOrders.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">注文がありません</p>
            <p className="text-gray-400 text-sm">
              新しい注文はここに表示されます
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {userOrders.map((order) => (
            <Link key={order.id} href={`/portal/orders/${order.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardBody>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        受注日: {formatDate(order.orderDate)}
                      </p>
                    </div>
                    <Badge
                      variant={BUY_ORDER_STATUS_COLORS[order.status as any]}
                    >
                      {BUY_ORDER_STATUS_LABELS[order.status as any]}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">納期</p>
                      <p className="text-sm font-medium text-gray-900">
                        {order.desiredDeliveryDate
                          ? formatDate(order.desiredDeliveryDate)
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">金額</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">進捗</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              {
                                ordered: '20%',
                                auction_processing: '40%',
                                purchased: '60%',
                                invoiced: '80%',
                                payment_received: '90%',
                                completed: '100%',
                              }[order.status as string] || '0%'
                            }`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <Button variant="ghost" size="sm" className="ml-auto">
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