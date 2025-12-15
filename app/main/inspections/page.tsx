'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { mockDeliveries } from '@/data/deliveries';
import { mockInspections } from '@/data/inspections';
import { mockOrders } from '@/data/orders';
import { mockClients } from '@/data/clients';
import {
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_COLORS,
  INSPECTION_STEP_LABELS,
} from '@/constants/status';
import { formatCurrency, formatDateJP } from '@/lib/utils';

export default function InspectionListPage() {
  // 納品書ごとに検収情報を集約
  const inspectionData = mockDeliveries.map((delivery) => {
    const inspection = mockInspections.find((i) => i.deliveryId === delivery.id);
    const order = mockOrders.find((o) => o.id === delivery.orderId);
    const client = mockClients.find((c) => c.id === delivery.clientId);

    return {
      delivery,
      inspection,
      order,
      client,
    };
  });

  // ステータス別集計
  const statusCounts = inspectionData.reduce(
    (acc, { delivery }) => {
      acc[delivery.status] = (acc[delivery.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // 検収待ちの件数
  const pendingCount = inspectionData.filter(
    (d) => d.delivery.status === 'issued' || d.delivery.status === 'received',
  ).length;

  // 検収完了の件数
  const completedCount = inspectionData.filter(
    (d) => d.delivery.status === 'inspected' || d.delivery.status === 'completed',
  ).length;

  return (
    <div>
      <PageHeader
        title="検収管理"
        subtitle="得意先からの検収報告状況を確認"
      />

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">総納品書数</p>
            <p className="text-3xl font-bold text-gray-900">
              {inspectionData.length}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">検収待ち</p>
            <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">検収完了</p>
            <p className="text-3xl font-bold text-green-600">{completedCount}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">完了率</p>
            <p className="text-3xl font-bold text-blue-600">
              {Math.round(
                (completedCount / (inspectionData.length || 1)) * 100,
              )}
              %
            </p>
          </CardBody>
        </Card>
      </div>

      {/* ステータス別集計 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">ステータス別</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {Object.entries(statusCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {DELIVERY_STATUS_LABELS[status as any]}
                    </span>
                    <Badge
                      variant={DELIVERY_STATUS_COLORS[status as any]}
                    >
                      {count}件
                    </Badge>
                  </div>
                ))}
            </div>
          </CardBody>
        </Card>

        {/* 進捗プログレスバー */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              検収進捗
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">発行済み</span>
                  <span className="text-sm font-medium">
                    {inspectionData.filter((d) => d.delivery.status === 'issued')
                      .length}
                    件
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (inspectionData.filter((d) => d.delivery.status === 'issued')
                          .length /
                          (inspectionData.length || 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">受領済み</span>
                  <span className="text-sm font-medium">
                    {inspectionData.filter((d) => d.delivery.status === 'received')
                      .length}
                    件
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-cyan-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (inspectionData.filter((d) => d.delivery.status === 'received')
                          .length /
                          (inspectionData.length || 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">検収完了</span>
                  <span className="text-sm font-medium">
                    {inspectionData.filter(
                      (d) =>
                        d.delivery.status === 'inspected' ||
                        d.delivery.status === 'completed',
                    ).length}
                    件
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (inspectionData.filter(
                          (d) =>
                            d.delivery.status === 'inspected' ||
                            d.delivery.status === 'completed',
                        ).length /
                          (inspectionData.length || 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 詳細一覧 */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">検収詳細</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {inspectionData.map(({ delivery, inspection, order, client }) => (
              <div
                key={delivery.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {delivery.deliveryNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order?.orderNumber} | {client?.name}
                    </p>
                  </div>
                  <Badge variant={DELIVERY_STATUS_COLORS[delivery.status]}>
                    {DELIVERY_STATUS_LABELS[delivery.status]}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 mb-0.5">納品日</p>
                    <p className="font-medium text-gray-900">
                      {formatDateJP(delivery.deliveryDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-0.5">金額</p>
                    <p className="font-medium text-gray-900">
                      {formatCurrency(delivery.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-0.5">受領</p>
                    <p className="font-medium">
                      {inspection?.receivedDate ? (
                        <span className="text-green-600">
                          ✓ {formatDateJP(inspection.receivedDate)}
                        </span>
                      ) : (
                        <span className="text-gray-400">待機中</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-0.5">検収</p>
                    <p className="font-medium">
                      {inspection?.inspectionDate ? (
                        <span className="text-green-600">
                          ✓ {formatDateJP(inspection.inspectionDate)}
                        </span>
                      ) : (
                        <span className="text-gray-400">待機中</span>
                      )}
                    </p>
                  </div>
                </div>

                {inspection?.inspectionNotes && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p className="font-medium mb-1">コメント:</p>
                    <p>{inspection.inspectionNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}