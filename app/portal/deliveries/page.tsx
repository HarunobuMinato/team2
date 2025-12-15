'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockDeliveries } from '@/data/deliveries';
import { mockOrders } from '@/data/orders';
import { mockUsers } from '@/data/users';
import {
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_COLORS,
} from '@/constants/status';
import { formatCurrency, formatDate } from '@/lib/utils';
import { User } from '@/types/auth';

export default function PortalDeliveryListPage() {
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

  // ログインユーザー（得意先）に関連する納品書を取得
  const userDeliveries = user?.clientId
    ? mockDeliveries.filter((d) => d.clientId === user.clientId)
    : [];

  return (
    <div>
      <PageHeader
        title="納品書確認"
        subtitle="発行された納品書を確認"
      />

      {userDeliveries.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">納品書がありません</p>
            <p className="text-gray-400 text-sm">
              納品書はここに表示されます
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {userDeliveries.map((delivery) => {
            const order = mockOrders.find((o) => o.id === delivery.orderId);
            return (
              <Link
                key={delivery.id}
                href={`/portal/deliveries/${delivery.id}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardBody>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {delivery.deliveryNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          受注: {order?.orderNumber}
                        </p>
                      </div>
                      <Badge
                        variant={DELIVERY_STATUS_COLORS[delivery.status]}
                      >
                        {DELIVERY_STATUS_LABELS[delivery.status]}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">納品日</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(delivery.deliveryDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">金額</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(delivery.totalAmount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Button variant="ghost" size="sm">
                          確認 →
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}