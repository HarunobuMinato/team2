'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateJP } from '@/lib/utils';

interface Order {
  id: number;
  order_number: string;
  order_type: string;
  client_id: number;
  total_amount: number;
}

interface Client {
  id: number;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
}

interface PurchaseRecord {
  id: number;
  vehicle_name: string;
  maker?: string;
  year?: number;
  mileage?: number;
  bid_price: number;
}

interface Delivery {
  id: number;
  order_id: number;
  delivery_number: string;
  vehicle_count: number;
  delivery_date: string;
  delivery_location?: string;
  total_amount: number;
  notes?: string;
  status: string;
  created_at: string;
}

export default function DeliveryDetailPage() {
  const params = useParams();
  const deliveryId = params.id as string;

  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 納品書詳細データを取得
  useEffect(() => {
    const fetchDeliveryDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`📋 納品書 ${deliveryId} の詳細を取得中...`);

        // 納品書を取得
        const deliveryRes = await fetch(`/api/deliveries/${deliveryId}`);
        const deliveryData = await deliveryRes.json();

        if (!deliveryData.success || !deliveryData.data) {
          throw new Error('納品書が見つかりません');
        }

        const deliveryInfo = deliveryData.data;
        setDelivery(deliveryInfo);

        console.log('✅ 納品書取得完了:', deliveryInfo);

        // 受注情報を取得
        const orderRes = await fetch(`/api/orders/${deliveryInfo.order_id}`);
        const orderData = await orderRes.json();

        if (orderData.success && orderData.data) {
          setOrder(orderData.data);

          // クライアント情報を取得
          if (orderData.data.client_id) {
            const clientRes = await fetch(
              `/api/clients/${orderData.data.client_id}`
            );
            const clientData = await clientRes.json();

            if (clientData.success && clientData.data) {
              setClient(clientData.data);
              console.log('✅ クライアント取得完了');
            }
          }

          console.log('✅ 受注取得完了');
        }

        // 納品書に紐づく仕入実績を取得
        const purchasesRes = await fetch(
          `/api/delivery-purchase-records/${deliveryInfo.id}`
        );
        const purchasesData = await purchasesRes.json();

        if (purchasesData.success && Array.isArray(purchasesData.data)) {
          setPurchaseRecords(purchasesData.data);
          console.log('✅ 仕入実績取得完了:', purchasesData.data.length, '件');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました';
        console.error('❌ 詳細取得エラー:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (deliveryId) {
      fetchDeliveryDetail();
    }
  }, [deliveryId]);

  // ステータス色
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      issued: 'bg-blue-100 text-blue-800',
      received: 'bg-green-100 text-green-800',
      inspected: 'bg-amber-100 text-amber-800',
      completed: 'bg-gray-400 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      draft: '下書き',
      issued: '発行済み',
      received: '受領済み',
      inspected: '検収済み',
      completed: '完了',
    };
    return labels[status] || status;
  };


  // ✅ 修正後
  const totalVehicleAmount = purchaseRecords.reduce(
    (sum, p) => sum + (parseInt(p?.bid_price) || 0),
    0
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">読み込み中...</p>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">
          {error || '納品書が見つかりません'}
        </p>
        <Link href="/main/deliveries">
          <Button>納品書一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="納品書詳細"
        subtitle={delivery.delivery_number}
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                window.print();
              }}
            >
              🖨️ 印刷
            </Button>
            <Link href="/main/deliveries">
              <Button variant="secondary">戻る</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メイン情報 */}
        <div className="lg:col-span-2">
          {/* 納品書情報 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  納品書情報
                </h2>
                <Badge variant={getStatusColor(delivery.status)}>
                  {getStatusLabel(delivery.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">納品書番号</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {delivery.delivery_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">納品日</p>
                  <p className="text-base text-gray-900">
                    {formatDateJP(delivery.delivery_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">納品場所</p>
                  <p className="text-base text-gray-900">
                    {delivery.delivery_location || '未指定'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">作成日</p>
                  <p className="text-base text-gray-900">
                    {delivery.created_at ? formatDateJP(delivery.created_at) : '—'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 受注・顧客情報 */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                受注・顧客情報
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">受注情報</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">
                      {order?.order_number || '-'}
                    </p>
                    {order && (
                      <Link
                        href={`/main/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        詳細 →
                      </Link>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">注文種別</p>
                      <p className="font-medium text-gray-900">
                        {order?.order_type === 'buy'
                          ? '買い注文'
                          : order?.order_type === 'sell'
                            ? '売り注文'
                            : '仲介売買'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">受注金額</p>
                      <p className="font-medium text-blue-600">
                        {formatCurrency(order?.total_amount || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">顧客情報</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-900 mb-1">
                    {client?.name || '-'}
                  </p>
                  {client?.contact_person && (
                    <p className="text-sm text-gray-600">{client.contact_person}</p>
                  )}
                  {client?.phone && (
                    <p className="text-sm text-gray-600">{client.phone}</p>
                  )}
                  {client?.email && (
                    <p className="text-sm text-gray-600">{client.email}</p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 納品車両一覧 */}
          {purchaseRecords.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  納品車両一覧
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
                      {purchaseRecords.map((purchase) => (
                        <tr
                          key={purchase?.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-3 text-gray-900">
                            <Link
                              href={`/main/vehicles/purchase/${purchase?.id}`}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              {purchase?.vehicle_name}
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
                            {formatCurrency(purchase?.bid_price || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}

          {/* 備考 */}
          {delivery.notes && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">備考</h2>
              </CardHeader>
              <CardBody>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {delivery.notes}
                </p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* 右サイドバー - 金額情報 */}
        <div>
          <Card className="sticky top-8 mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">金額情報</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {/* 受注金額 */}
                {order && (
                  <>
                    <div className="pb-3 border-b border-gray-200">
                      <p className="text-xs text-gray-600 mb-2 font-medium">
                        受注情報
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">受注合計</span>
                          <span className="font-medium">
                            {formatCurrency(order.total_amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 納品車両情報 */}
                <div className="pb-3 border-b border-gray-200">
                  <p className="text-xs text-gray-600 mb-2 font-medium">
                    納品車両情報
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">台数</span>
                      <span className="font-medium">
                        {purchaseRecords.length}台
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">車両合計</span>
                      <span className="font-medium">
                        {formatCurrency(totalVehicleAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 納品書金額 */}
                <div>
                  <p className="text-xs text-gray-600 mb-2 font-medium">
                    納品書金額
                  </p>
                  <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                    <span className="font-semibold text-gray-900">
                      合計
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(delivery.total_amount)}
                    </span>
                  </div>
                </div>

                {/* アクション */}
                <div className="mt-6 space-y-2 border-t border-gray-200 pt-4">
                  {delivery.status === 'issued' && (
                    <Button variant="primary" size="sm" className="w-full">
                      📧 得意先に発行
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" className="w-full">
                    ✏️ 編集
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full">
                    🗑️ 削除
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* ステータス情報 */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                ステータス
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">発行状況</span>
                <Badge variant={getStatusColor(delivery.status)}>
                  {getStatusLabel(delivery.status)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">作成者</p>
                <p className="text-base font-medium text-gray-900">
                  システム
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">作成日時</p>
                <p className="text-base text-gray-900">
                  {delivery.created_at ? formatDateJP(delivery.created_at) : '-'}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}