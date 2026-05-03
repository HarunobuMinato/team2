'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import {
  BUY_ORDER_STATUS_LABELS,
  BUY_ORDER_STATUS_COLORS,
  SELL_ORDER_STATUS_LABELS,
  SELL_ORDER_STATUS_COLORS,
  MEDIATION_ORDER_STATUS_LABELS,
  MEDIATION_ORDER_STATUS_COLORS,
} from '@/constants/status';
import { formatCurrency, formatDateJP } from '@/lib/utils';
import { Order } from '@/types/order';
import { PurchaseRecord } from '@/types/purchase-record';

interface Client {
  id: number;
  name: string;
  contact_person?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface DesiredVehicle {
  id: number;
  sequence_number: number;
  vehicle_name: string;
  maker?: string;
  model?: string;
  desired_year_from?: number;
  desired_year_to?: number;
  desired_mileage_max?: number;
  color?: string;
  notes?: string;
}

interface Shipment {
  id: number;
  shipment_number: string;
  shipment_date: string;
  status: string;
  vehicle_count: number;
  delivery_date?: string;
  transport_cost: number;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [salesPerson, setSalesPerson] = useState<User | null>(null);
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);
  const [desiredVehicles, setDesiredVehicles] = useState<DesiredVehicle[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`📖 受注詳細データを取得中... Order ID=${orderId}`);

        // 受注データ取得
        const orderResponse = await fetch(`/api/orders/${orderId}`);
        const orderData = await orderResponse.json();

        if (!orderData.success || !orderData.data) {
          setError('受注が見つかりません');
          setLoading(false);
          return;
        }

        const fetchedOrder = orderData.data;
        setOrder(fetchedOrder);
        console.log('✅ 受注情報取得完了:', fetchedOrder);

        // 取引先情報取得
        if (fetchedOrder.client_id) {
          console.log('📖 aaaaaaaaaaaaaaaa', fetchedOrder.client_id);
          try {
            const clientResponse = await fetch(`/api/clients/${fetchedOrder.client_id}`);
            const clientData = await clientResponse.json();
            console.log('📋 取引先情報:', clientData);
            if (clientData.success) {
              setClient(clientData.data);
            }
          } catch (err) {
            console.warn('⚠️ 取引先情報の取得に失敗:', err);
          }
        }

        // 営業担当者情報取得
        if (fetchedOrder.sales_person_id) {
          try {
            const userResponse = await fetch(`/api/users/${fetchedOrder.sales_person_id}`);
            const userData = await userResponse.json();
            console.log('📋 営業担当者情報:', userData);
            if (userData.success) {
              setSalesPerson(userData.data);
            }
          } catch (err) {
            console.warn('⚠️ 営業担当者情報の取得に失敗:', err);
          }
        }

        // 仕入実績データ取得
        if (fetchedOrder.order_type === 'buy') {
          try {
            const purchaseResponse = await fetch(
              `/api/purchase-records?order_id=${orderId}`
            );
            const purchaseData = await purchaseResponse.json();
            if (purchaseData.success) {
              setPurchaseRecords(purchaseData.data || []);
              console.log('✅ 仕入実績取得完了:', purchaseData.data?.length || 0, '件');
            }
          } catch (err) {
            console.warn('⚠️ 仕入実績の取得に失敗:', err);
          }

          // 希望車両データ取得
          try {
            const vehicleResponse = await fetch(
              `/api/desired-vehicles?order_id=${orderId}`
            );
            const vehicleData = await vehicleResponse.json();
            if (vehicleData.success) {
              setDesiredVehicles(vehicleData.data || []);
              console.log('✅ 希望車両取得完了:', vehicleData.data?.length || 0, '件');
            }
          } catch (err) {
            console.warn('⚠️ 希望車両の取得に失敗:', err);
          }
        }

        // 出荷データ取得
        try {
          const shipmentResponse = await fetch(
            `/api/shipments?order_id=${orderId}`
          );
          const shipmentData = await shipmentResponse.json();
          if (shipmentData.success) {
            setShipments(shipmentData.data || []);
            console.log('✅ 出荷情報取得完了:', shipmentData.data?.length || 0, '件');
          }
        } catch (err) {
          console.warn('⚠️ 出荷情報の取得に失敗:', err);
        }
      } catch (err) {
        console.error('❌ データ取得エラー:', err);
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchData();
    }
  }, [orderId]);

  // ステータスラベルを取得
  const getStatusLabel = (): string => {
    if (!order) return '-';
    if (order.order_type === 'buy') {
      return BUY_ORDER_STATUS_LABELS[order.status as any];
    }
    if (order.order_type === 'sell') {
      return SELL_ORDER_STATUS_LABELS[order.status as any];
    }
    return MEDIATION_ORDER_STATUS_LABELS[order.status as any];
  };

  // ステータスカラーを取得
  const getStatusColor = (): string => {
    if (!order) return '';
    if (order.order_type === 'buy') {
      return BUY_ORDER_STATUS_COLORS[order.status as any];
    }
    if (order.order_type === 'sell') {
      return SELL_ORDER_STATUS_COLORS[order.status as any];
    }
    return MEDIATION_ORDER_STATUS_COLORS[order.status as any];
  };

  // 注文種別ラベルを取得
  const getOrderTypeLabel = (): string => {
    if (!order) return '-';
    const types: { [key: string]: string } = {
      buy: '買い注文',
      sell: '売り注文',
      mediation: '仲介売買',
    };
    return types[order.order_type] || order.order_type;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">読み込み中...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">受注が見つかりません</p>
        <Link href="/main/orders">
          <Button>受注一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="受注詳細"
        subtitle={`${order.order_number} - ${getOrderTypeLabel()}`}
        actions={
          <div className="flex gap-2">
            <Link href={`/main/orders/${orderId}/progress`}>
              <Button variant="primary">進捗管理</Button>
            </Link>
            <Link href="/main/orders">
              <Button variant="secondary">戻る</Button>
            </Link>
          </div>
        }
      />

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardBody>
            <p className="text-red-700">⚠️ {error}</p>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 基本情報 */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">基本情報</h2>
                <Badge variant={getStatusColor()}>{getStatusLabel()}</Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">受注番号</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {order.order_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">注文種別</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {getOrderTypeLabel()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">受注日</p>
                  <p className="text-base text-gray-900">
                    {formatDateJP(order.order_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">希望納期</p>
                  <p className="text-base text-gray-900">
                    {order.desired_delivery_date
                      ? formatDateJP(order.desired_delivery_date)
                      : '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">車両台数</p>
                  <p className="text-base text-gray-900">
                    {order.vehicle_count}台
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 希望車両セクション */}
          {order.order_type === 'buy' && desiredVehicles.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  希望車両仕様 ({desiredVehicles.length}台)
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {desiredVehicles
                    .sort((a, b) => a.sequence_number - b.sequence_number)
                    .map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="p-4 rounded-lg bg-gray-50 border border-gray-200"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">車種名</p>
                            <p className="font-medium text-gray-900">
                              {vehicle.vehicle_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">メーカー</p>
                            <p className="text-gray-900">
                              {vehicle.maker || '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">型式</p>
                            <p className="text-gray-900">
                              {vehicle.model || '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">希望年式</p>
                            <p className="text-gray-900">
                              {vehicle.desired_year_from && vehicle.desired_year_to
                                ? `${vehicle.desired_year_from}～${vehicle.desired_year_to}年`
                                : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* 仕入実績セクション */}
          {order.order_type === 'buy' && purchaseRecords.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  仕入実績 ({purchaseRecords.length}台)
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {purchaseRecords
                    .sort((a, b) => a.sequence_number - b.sequence_number)
                    .map((purchase) => (
                      <Link
                        key={purchase.id}
                        href={`/main/vehicles/purchase/${purchase.id}`}
                        className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {purchase.vehicle_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDateJP(purchase.auction_date)}
                            </p>
                          </div>
                          <Badge variant="bg-blue-100 text-blue-800">
                            {purchase.status || '-'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">年式</p>
                            <p className="font-medium text-gray-900">
                              {purchase.year || '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">走行距離</p>
                            <p className="font-medium text-gray-900">
                              {purchase.mileage
                                ? `${purchase.mileage}km`
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">落札価格</p>
                            <p className="font-semibold text-blue-600">
                              {formatCurrency(purchase.bid_price)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link href={`/main/vehicles/purchase/new?orderId=${orderId}`}>
                    <Button type="button" variant="secondary" fullWidth>
                      + 仕入実績を追加
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          )}

          {/* 出荷セクション */}
          {shipments.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  出荷情報 ({shipments.length}件)
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {shipments.map((shipment) => (
                    <Link
                      key={shipment.id}
                      href={`/main/shipments/${shipment.id}`}
                      className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {shipment.shipment_number}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDateJP(shipment.shipment_date)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            shipment.status === 'draft'
                              ? 'bg-gray-100 text-gray-800'
                              : shipment.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : shipment.status === 'in_transit'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-green-100 text-green-800'
                          }
                        >
                          {shipment.status === 'draft'
                            ? '下書き'
                            : shipment.status === 'confirmed'
                              ? '確認済み'
                              : shipment.status === 'in_transit'
                                ? '配送中'
                                : '配送完了'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">車両台数</p>
                          <p className="font-medium text-gray-900">
                            {shipment.vehicle_count}台
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">
                            配送予定日
                          </p>
                          <p className="font-medium text-gray-900">
                            {shipment.delivery_date
                              ? formatDateJP(shipment.delivery_date)
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">陸送費</p>
                          <p className="font-semibold text-blue-600">
                            {formatCurrency(shipment.transport_cost)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link href={`/main/shipments/new?orderId=${orderId}`}>
                    <Button type="button" variant="secondary" fullWidth>
                      + 出荷を登録
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          )}

          {/* 取引先情報 */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">取引先情報</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">依頼者</p>
                  <p className="text-base font-medium text-gray-900">
                    {client?.name || '-'}
                  </p>
                  {client?.contact_person && (
                    <p className="text-sm text-gray-500">{client.contact_person}</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">営業担当者</p>
                  <p className="text-base font-medium text-gray-900">
                    {salesPerson?.name || '-'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 備考 */}
          {order.notes && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">備考</h2>
              </CardHeader>
              <CardBody>
                <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* 右サイドバー - 統計情報 */}
        <div>
          <Card className="sticky top-8 mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                仕入実績統計
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">登録済み</span>
                <span className="font-semibold text-gray-900">
                  {purchaseRecords.filter((p) => p.status === 'recorded').length}台
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">未登録</span>
                <span className="font-semibold text-gray-900">
                  {purchaseRecords.filter((p) => p.status === 'pending').length}台
                </span>
              </div>

              {purchaseRecords.length > 0 && (
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      落札価格合計
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(
                        purchaseRecords.reduce(
                          (sum, p) => sum + Number(p.bid_price),
                          0
                        )
                      )}
                    </span>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* 出荷統計 */}
          {shipments.length > 0 && (
            <Card className="sticky top-96">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  出荷統計
                </h2>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">下書き</span>
                  <span className="font-semibold">
                    {shipments.filter((s) => s.status === 'draft').length}件
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">確認済み</span>
                  <span className="font-semibold">
                    {shipments.filter((s) => s.status === 'confirmed').length}件
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">配送中</span>
                  <span className="font-semibold">
                    {shipments.filter((s) => s.status === 'in_transit').length}件
                  </span>
                </div>

                {shipments.length > 0 && (
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        陸送費合計
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(
                          shipments.reduce(
                            (sum, s) => sum + s.transport_cost,
                            0
                          )
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}