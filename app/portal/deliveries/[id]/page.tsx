'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { InspectionForm } from '@/components/forms/inspection-form';
import { mockDeliveries } from '@/data/deliveries';
import { mockInspections } from '@/data/inspections';
import { mockOrders } from '@/data/orders';
import {
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_COLORS,
} from '@/constants/status';
import { formatCurrency, formatDateJP } from '@/lib/utils';

export default function PortalDeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deliveryId = params.id as string;

  const delivery = mockDeliveries.find((d) => d.id === deliveryId);
  const order = delivery && mockOrders.find((o) => o.id === delivery.orderId);
  const inspection = mockInspections.find((i) => i.deliveryId === deliveryId);
  const [isLoading, setIsLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');

  if (!delivery) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">納品書が見つかりません</p>
        <Link href="/portal/deliveries">
          <Button>納品書一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  const handleInspectionSubmit = async (formData: any) => {
    setIsLoading(true);

    try {
      // バックエンド実装時のシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('検収データ送信:', {
        deliveryId,
        ...formData,
      });

      setSuccessMessage('検収を完了しました');

      // 2秒後に納品書一覧にリダイレクト
      setTimeout(() => {
        router.push('/portal/portal/deliveries');
      }, 2000);
    } catch (error) {
      console.error('エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="納品受領・検収"
        subtitle={delivery.deliveryNumber}
        actions={
          <Link href="/portal/portal/deliveries">
            <Button variant="secondary">戻る</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 検収フォーム */}
        <div className="lg:col-span-2">
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700">✓ {successMessage}</p>
            </div>
          )}

          <InspectionForm
            inspection={inspection}
            onSubmit={handleInspectionSubmit}
            isLoading={isLoading}
          />
        </div>

        {/* 納品書情報（右側固定） */}
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">納品書情報</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">納品書番号</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {delivery.deliveryNumber}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 mb-1">受注番号</p>
                  <p className="text-sm font-medium text-gray-900">
                    {order?.orderNumber || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 mb-1">ステータス</p>
                  <Badge variant={DELIVERY_STATUS_COLORS[delivery.status]}>
                    {DELIVERY_STATUS_LABELS[delivery.status]}
                  </Badge>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs text-gray-600 mb-1">納品日</p>
                  <p className="text-sm text-gray-900">
                    {formatDateJP(delivery.deliveryDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 mb-1">合計金額</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(delivery.totalAmount)}
                  </p>
                </div>

                {/* 金額詳細 */}
                <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">車両価格</span>
                    <span className="font-medium">
                      {formatCurrency(delivery.vehiclePrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">手数料</span>
                    <span className="font-medium">
                      {formatCurrency(delivery.commission)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">消費税</span>
                    <span className="font-medium">
                      {formatCurrency(delivery.tax)}
                    </span>
                  </div>
                </div>

                {/* 検収状況 */}
                {inspection && (
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs text-gray-600 font-semibold mb-2">
                      検収状況
                    </p>
                    <div className="space-y-1 text-xs">
                      {inspection.receivedDate && (
                        <div className="flex items-center">
                          <span className="text-green-600">✓</span>
                          <span className="ml-1 text-gray-700">
                            受領済み ({formatDateJP(inspection.receivedDate)})
                          </span>
                        </div>
                      )}
                      {inspection.inspectionDate && (
                        <div className="flex items-center">
                          <span className="text-green-600">✓</span>
                          <span className="ml-1 text-gray-700">
                            検収完了 ({formatDateJP(inspection.inspectionDate)})
                          </span>
                        </div>
                      )}
                    </div>
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