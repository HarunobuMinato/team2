'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateJP } from '@/lib/utils';

interface PurchaseRecord {
  id: number;
  vehicle_name: string;
  maker?: string;
  model?: string;
  year?: number;
  mileage?: number;
  color?: string;
  chassis_number?: string;
  registration_number?: string;
  inspection_date?: string;
  auction_date: string;
  // 【修正】正確な金額フィールド
  bid_price: number; // 落札車両代金
  tax_amount?: number; // 自動車税
  bid_fee?: number; // 成約落札料
  total_purchase_price?: number; // 仕入総額（自動計算）
  status: string;
  variance_reason?: string;
  notes?: string;
  order_id: number;
  desired_vehicle_id?: number;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: number;
  order_number: string;
  client_id: number;
}

interface Client {
  id: number;
  name: string;
  contact_person?: string;
}

interface DesiredVehicle {
  id: number;
  vehicle_name: string;
  desired_year_from?: number;
  desired_year_to?: number;
  desired_mileage_max?: number;
  color?: string;
}

export default function PurchaseRecordDetailPage() {
  const params = useParams();
  const purchaseId = params.id as string;

  const [purchase, setPurchase] = useState<PurchaseRecord | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [desiredVehicle, setDesiredVehicle] = useState<DesiredVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`📖 仕入実績詳細データを取得中... Purchase ID=${purchaseId}`);

        // 仕入実績を取得
        const purchaseRes = await fetch(`/api/purchase-records/${purchaseId}`);
        const purchaseData = await purchaseRes.json();

        if (!purchaseData.success || !purchaseData.data) {
          setError('仕入実績が見つかりません');
          setLoading(false);
          return;
        }

        const fetchedPurchase = purchaseData.data;
        setPurchase(fetchedPurchase);
        console.log('✅ 仕入実績取得完了:', fetchedPurchase);

        // 受注を取得
        if (fetchedPurchase.order_id) {
          try {
            const orderRes = await fetch(`/api/orders/${fetchedPurchase.order_id}`);
            const orderData = await orderRes.json();
            if (orderData.success && orderData.data) {
              setOrder(orderData.data);
              console.log('✅ 受注情報取得完了:', orderData.data.order_number);

              // クライアントを取得
              if (orderData.data.client_id) {
                try {
                  const clientRes = await fetch(
                    `/api/clients/${orderData.data.client_id}`
                  );
                  const clientData = await clientRes.json();
                  if (clientData.success) {
                    setClient(clientData.data);
                    console.log('✅ クライアント情報取得完了:', clientData.data.name);
                  }
                } catch (err) {
                  console.warn('⚠️ クライアント情報取得失敗:', err);
                }
              }
            }
          } catch (err) {
            console.warn('⚠️ 受注情報取得失敗:', err);
          }
        }

        // 希望車両を取得
        if (fetchedPurchase.desired_vehicle_id) {
          try {
            const vehicleRes = await fetch(
              `/api/desired-vehicles/${fetchedPurchase.desired_vehicle_id}`
            );
            const vehicleData = await vehicleRes.json();
            if (vehicleData.success) {
              setDesiredVehicle(vehicleData.data);
              console.log('✅ 希望車両取得完了');
            }
          } catch (err) {
            console.warn('⚠️ 希望車両取得失敗:', err);
          }
        }
      } catch (err) {
        console.error('❌ データ取得エラー:', err);
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (purchaseId) {
      fetchData();
    }
  }, [purchaseId]);

  // ステータス色
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'bg-indigo-100 text-indigo-800',
      recorded: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: '未登録',
      recorded: '登録済み',
      completed: '完了',
    };
    return labels[status] || status;
  };

  // 【修正】合計金額を計算
  const calculateTotal = () => {
    if (!purchase) return 0;
    return (
      (purchase.bid_price || 0) +
      (purchase.tax_amount || 0) +
      (purchase.bid_fee || 0)
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">読み込み中...</p>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">仕入実績が見つかりません</p>
        <Link href="/main/vehicles/purchase">
          <Button>仕入実績一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="仕入実績詳細"
        subtitle={`${purchase.vehicle_name}`}
        actions={
          <div className="flex gap-2">
            <Link href={`/main/vehicles/purchase/${purchaseId}/edit`}>
              <Button variant="primary">編集</Button>
            </Link>
            <Link href="/main/vehicles/purchase">
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
          {/* 仕入実績基本情報 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  仕入実績情報
                </h2>
                <Badge variant={getStatusColor(purchase.status)}>
                  {getStatusLabel(purchase.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">落札日</p>
                  <p className="text-base text-gray-900">
                    {formatDateJP(purchase.auction_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">落札車両代金</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {formatCurrency(purchase.bid_price)}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 車両情報 */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">車両情報</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">車種名</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {purchase.vehicle_name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">メーカー</p>
                    <p className="text-gray-900">{purchase.maker || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">型式</p>
                    <p className="text-gray-900">{purchase.model || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">年式</p>
                    <p className="text-gray-900">{purchase.year || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">走行距離</p>
                    <p className="text-gray-900">
                      {purchase.mileage
                        ? `${purchase.mileage.toLocaleString()}km`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">色</p>
                    <p className="text-gray-900">{purchase.color || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">車検期限</p>
                    <p className="text-gray-900">
                      {purchase.inspection_date
                        ? formatDateJP(purchase.inspection_date)
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">車台番号</p>
                    <p className="text-gray-900">
                      {purchase.chassis_number || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">登録番号</p>
                    <p className="text-gray-900">
                      {purchase.registration_number || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 希望との差分 */}
          {desiredVehicle && (
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  希望との比較
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs font-medium text-gray-600 mb-2">
                        希望仕様
                      </p>
                      <div className="space-y-1 text-sm">
                        <p>
                          年式:
                          <span className="font-medium">
                            {desiredVehicle.desired_year_from}～
                            {desiredVehicle.desired_year_to}年
                          </span>
                        </p>
                        <p>
                          走行距離:
                          <span className="font-medium">
                            {desiredVehicle.desired_mileage_max}km以下
                          </span>
                        </p>
                        {desiredVehicle.color && (
                          <p>
                            色:
                            <span className="font-medium">
                              {desiredVehicle.color}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-xs font-medium text-gray-600 mb-2">
                        実績
                      </p>
                      <div className="space-y-1 text-sm">
                        <p>
                          年式:
                          <span className="font-medium">{purchase.year}年</span>
                        </p>
                        <p>
                          走行距離:
                          <span className="font-medium">
                            {purchase.mileage?.toLocaleString()}km
                          </span>
                        </p>
                        {purchase.color && (
                          <p>
                            色:
                            <span className="font-medium">{purchase.color}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {purchase.variance_reason && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-yellow-700 mb-1">
                        差分理由
                      </p>
                      <p className="text-sm text-yellow-800">
                        {purchase.variance_reason}
                      </p>
                    </div>
                  )}
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
                  <p className="text-sm text-gray-600 mb-1">受注番号</p>
                  {order ? (
                    <Link
                      href={`/main/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {order.order_number}
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
                  {client?.contact_person && (
                    <p className="text-sm text-gray-500">{client.contact_person}</p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 備考 */}
          {purchase.notes && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">備考</h2>
              </CardHeader>
              <CardBody>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {purchase.notes}
                </p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* 右サイドバー */}
        <div>
          {/* 【修正】金額情報 */}
          <Card className="sticky top-8 mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">金額情報</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">落札車両代金</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(purchase.bid_price)}
                </span>
              </div>

              {purchase.tax_amount && purchase.tax_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">自動車税</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(purchase.tax_amount)}
                  </span>
                </div>
              )}

              {purchase.bid_fee && purchase.bid_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">成約落札料</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(purchase.bid_fee)}
                  </span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">仕入総額</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* ステータス情報 */}
          <Card className="sticky top-96">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                ステータス
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-2">現在のステータス</p>
                  <Badge variant={getStatusColor(purchase.status)}>
                    {getStatusLabel(purchase.status)}
                  </Badge>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>
                    登録日:
                    <span className="font-medium">
                      {formatDateJP(purchase.created_at)}
                    </span>
                  </p>
                  <p>
                    更新日:
                    <span className="font-medium">
                      {formatDateJP(purchase.updated_at)}
                    </span>
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}