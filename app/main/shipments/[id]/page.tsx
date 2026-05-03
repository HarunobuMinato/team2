'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { mockShipments, mockShipmentPurchases } from '@/data/shipments';
import { mockTransportCompanies } from '@/data/transport-companies';
import { mockPurchaseRecords } from '@/data/purchase-records';
import { mockOrders } from '@/data/orders';
import { mockClients } from '@/data/clients';
import { formatCurrency, formatDateJP } from '@/lib/utils';

export default function ShipmentDetailPage() {
  const params = useParams();
  const shipmentId = params.id as string;

  // モックデータから出荷を取得
  const shipment = mockShipments.find((s) => s.id === shipmentId);

  if (!shipment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">出荷が見つかりません</p>
        <Link href="/main/shipments">
          <Button>出荷一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  // 関連データの取得
  const order = mockOrders.find((o) => o.id === shipment.orderId);
  const client = order ? mockClients.find((c) => c.id === order.clientId) : null;
  const transportCompany = mockTransportCompanies.find(
    (tc) => tc.id === shipment.transportCompanyId
  );

  // この出荷に紐づいた仕入実績を取得
  const shipmentPurchases = mockShipmentPurchases.filter(
    (sp) => sp.shipmentId === shipmentId
  );
  const relatedPurchaseRecords = shipmentPurchases
    .map((sp) => mockPurchaseRecords.find((p) => p.id === sp.purchaseRecordId))
    .filter(Boolean);

  // ステータス色
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-amber-100 text-amber-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-gray-400 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      draft: '下書き',
      confirmed: '確認済み',
      in_transit: '配送中',
      delivered: '配送完了',
      completed: '完了',
    };
    return labels[status] || status;
  };

  const totalVehicleAmount = relatedPurchaseRecords.reduce(
    (sum, p) => sum + (p?.bidPrice || 0),
    0
  );

  return (
    <div>
      <PageHeader
        title="出荷詳細"
        subtitle={`${shipment.shipmentNumber} - ${shipment.vehicleCount}台`}
        actions={
          <div className="flex gap-2">
            <Link href="/main/shipments">
              <Button variant="secondary">戻る</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メイン情報 */}
        <div className="lg:col-span-2">
          {/* 基本情報 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  出荷情報
                </h2>
                <Badge variant={getStatusColor(shipment.status)}>
                  {getStatusLabel(shipment.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">出荷番号</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {shipment.shipmentNumber}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">出荷日</p>
                  <p className="text-base text-gray-900">
                    {formatDateJP(shipment.shipmentDate)}
                  </p>
                </div>

                {shipment.pickupDate && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">集荷日</p>
                    <p className="text-base text-gray-900">
                      {formatDateJP(shipment.pickupDate)}
                    </p>
                  </div>
                )}

                {shipment.deliveryDate && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">配送予定日</p>
                    <p className="text-base text-gray-900">
                      {formatDateJP(shipment.deliveryDate)}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-1">台数</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {shipment.vehicleCount}台
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">車両合計金額</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatCurrency(totalVehicleAmount)}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 出荷車両一覧 */}
          {relatedPurchaseRecords.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  出荷車両一覧
                </h2>
              </CardHeader>
              <CardBody>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-3 font-semibold text-gray-700">
                          車種名
                        </th>
                        <th className="text-left py-3 px-3 font-semibold text-gray-700">
                          メーカー
                        </th>
                        <th className="text-center py-3 px-3 font-semibold text-gray-700">
                          年式
                        </th>
                        <th className="text-center py-3 px-3 font-semibold text-gray-700">
                          走行距離
                        </th>
                        <th className="text-right py-3 px-3 font-semibold text-gray-700">
                          落札価格
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatedPurchaseRecords.map((purchase) => (
                        <tr
                          key={purchase?.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-3 text-gray-900">
                            <Link
                              href={`/main/vehicles/purchase/${purchase?.id}`}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              {purchase?.vehicleName}
                            </Link>
                          </td>
                          <td className="py-3 px-3 text-gray-600">
                            {purchase?.maker || '-'}
                          </td>
                          <td className="py-3 px-3 text-center text-gray-600">
                            {purchase?.year || '-'}年
                          </td>
                          <td className="py-3 px-3 text-center text-gray-600">
                            {purchase?.mileage
                              ? `${purchase.mileage.toLocaleString()}km`
                              : '-'}
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-gray-900">
                            {formatCurrency(purchase?.bidPrice || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}

          {/* 取引先情報 */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                取引先情報
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">受注番号</p>
                  {order ? (
                    <Link
                      href={`/main/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {order.orderNumber}
                    </Link>
                  ) : (
                    <p className="text-base text-gray-900">-</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">顧客名</p>
                  <p className="text-base font-medium text-gray-900">
                    {client?.name || '-'}
                  </p>
                  {client?.contactPerson && (
                    <p className="text-sm text-gray-500">{client.contactPerson}</p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 陸送情報 */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">陸送情報</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">陸送業者</p>
                  <p className="text-base font-medium text-gray-900">
                    {transportCompany?.name || '-'}
                  </p>
                  {transportCompany && (
                    <>
                      <p className="text-sm text-gray-500">
                        {transportCompany.phone}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transportCompany.address}
                      </p>
                    </>
                  )}
                </div>

                {shipment.transportNotes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">特記事項</p>
                    <p className="text-base text-gray-900 whitespace-pre-wrap">
                      {shipment.transportNotes}
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 右サイドバー - 費用情報 */}
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">費用情報</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">車両合計</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(totalVehicleAmount)}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">陸送費用</span>
                    <span className="font-medium">
                      {formatCurrency(shipment.transportCost)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">合計金額</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(
                        totalVehicleAmount + shipment.transportCost
                      )}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">📦 出荷ステータス</p>
                  <Badge variant={getStatusColor(shipment.status)}>
                    {getStatusLabel(shipment.status)}
                  </Badge>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}