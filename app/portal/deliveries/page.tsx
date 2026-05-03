'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateJP } from '@/lib/utils';

interface Delivery {
  id: number;
  order_id: number;
  delivery_number: string;
  vehicle_count: number;
  delivery_date: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface PurchaseRecord {
  id: number;
  vehicle_name: string;
  year?: number;
  bid_price: number;
}

interface Order {
  id: number;
  order_number: string;
}

interface Inspection {
  id: number;
  delivery_id: number;
  inspection_result: string;
  inspection_date?: string;
  received_date?: string;
  inspection_notes?: string;
}

interface EnrichedDelivery {
  delivery: Delivery;
  order?: Order;
  purchaseRecords: PurchaseRecord[];
  inspection?: Inspection;
}

export default function PortalDeliveryListPage() {
  const [deliveries, setDeliveries] = useState<EnrichedDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<number | null>(null);

  // ユーザー情報を取得
  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData.client_id) {
          setClientId(userData.client_id);
        }
      } catch (err) {
        console.warn('⚠️ ユーザー情報の解析エラー:', err);
      }
    }
  }, []);

  // 納品書一覧を取得
  useEffect(() => {
    if (!clientId) return;

    const fetchDeliveries = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`📋 クライアント ${clientId} の納品書一覧を取得中...`);

        // クライアントに関連する受注を取得
        const ordersRes = await fetch(`/api/orders?client_id=${clientId}`);
        const ordersData = await ordersRes.json();

        if (!ordersData.success || !Array.isArray(ordersData.data)) {
          throw new Error('受注の取得に失敗しました');
        }

        const orderIds = ordersData.data.map((o: any) => o.id);

        // 各受注に関連する納品書を取得
        const allDeliveries = await Promise.all(
          orderIds.map(async (orderId: number) => {
            const deliveryRes = await fetch(
              `/api/deliveries?order_id=${orderId}`
            );
            const deliveryData = await deliveryRes.json();
            return deliveryData.success ? deliveryData.data || [] : [];
          })
        );

        const flatDeliveries = allDeliveries.flat();

        console.log(`✅ 納品書取得完了: ${flatDeliveries.length}件`);

        // 各納品書について詳細情報を取得
        const enrichedDeliveries = await Promise.all(
          flatDeliveries.map(async (delivery: Delivery) => {
            try {
              // 受注情報を取得
              const orderRes = await fetch(`/api/orders/${delivery.order_id}`);
              const orderData = await orderRes.json();

              // 仕入実績を取得
              let purchaseRecords: PurchaseRecord[] = [];
              try {
                const purchasesRes = await fetch(
                  `/api/delivery-purchase-records/${delivery.id}`
                );
                const purchasesData = await purchasesRes.json();
                if (
                  purchasesData.success &&
                  Array.isArray(purchasesData.data)
                ) {
                  purchaseRecords = purchasesData.data;
                }
              } catch (err) {
                console.warn('⚠️ 仕入実績取得エラー:', err);
              }

              // 検収情報を取得
              let inspection: Inspection | undefined;
              try {
                const inspectionRes = await fetch(
                  `/api/inspections?delivery_id=${delivery.id}`
                );
                const inspectionData = await inspectionRes.json();
                if (inspectionData.success && inspectionData.data.inspection) {
                  inspection = inspectionData.data.inspection;
                }
              } catch (err) {
                console.warn('⚠️ 検収情報取得エラー:', err);
              }

              return {
                delivery,
                order: orderData.success ? orderData.data : undefined,
                purchaseRecords,
                inspection,
              };
            } catch (err) {
              console.warn('⚠️ 詳細情報取得エラー:', err);
              return {
                delivery,
                purchaseRecords: [],
              };
            }
          })
        );

        setDeliveries(enrichedDeliveries);
        console.log('✅ 全詳細情報取得完了');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました';
        console.error('❌ 納品書一覧取得エラー:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, [clientId]);

  // ステータスサマリー
  const statusSummary = {
    issued: deliveries.filter((d) => d.delivery.status === 'issued').length,
    received: deliveries.filter((d) => d.delivery.status === 'received').length,
    inspected: deliveries.filter((d) => d.inspection?.inspection_result === 'ok')
      .length,
  };

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

  const getInspectionLabel = (result?: string): string => {
    const labels: Record<string, string> = {
      pending: '未検収',
      ok: '良好',
      ng: '要確認',
      completed: '完了',
    };
    return labels[result || 'pending'] || '未検収';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">読み込み中...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="納品書確認"
        subtitle="発行された納品書を確認・検収"
      />

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardBody>
            <p className="text-red-700">❌ {error}</p>
          </CardBody>
        </Card>
      )}

      {/* ステータスサマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">発行済み</p>
            <p className="text-2xl font-bold text-blue-600">
              {statusSummary.issued}件
            </p>
            <p className="text-xs text-gray-500 mt-2">検収待ち</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">受領済み</p>
            <p className="text-2xl font-bold text-amber-600">
              {statusSummary.received}件
            </p>
            <p className="text-xs text-gray-500 mt-2">確認中</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 mb-1">検収完了</p>
            <p className="text-2xl font-bold text-green-600">
              {statusSummary.inspected}件
            </p>
            <p className="text-xs text-gray-500 mt-2">良好</p>
          </CardBody>
        </Card>
      </div>

      {/* 納品書一覧 */}
      {deliveries.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">納品書がありません</p>
            <p className="text-gray-400 text-sm">
              発行された納品書はここに表示されます
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {deliveries.map(({ delivery, order, purchaseRecords, inspection }) => {
            const needsInspection =
              delivery.status === 'issued' ||
              delivery.status === 'received' ||
              (inspection?.inspection_result === 'pending' ||
                inspection?.inspection_result === 'ng');

            return (
              <Link key={delivery.id} href={`/portal/deliveries/${delivery.id}`}>
                <Card
                  className={`hover:shadow-md transition-shadow cursor-pointer ${
                    needsInspection ? 'border-l-4 border-orange-500' : ''
                  }`}
                >
                  <CardBody>
                    {/* ヘッダー */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {delivery.delivery_number}
                        </p>
                        <p className="text-sm text-gray-500">
                          受注: {order?.order_number} | 納品日:{' '}
                          {formatDateJP(delivery.delivery_date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {needsInspection && (
                          <Badge variant="bg-orange-100 text-orange-800">
                            検収待ち
                          </Badge>
                        )}
                        <Badge variant={getStatusColor(delivery.status)}>
                          {getStatusLabel(delivery.status)}
                        </Badge>
                        {inspection && (
                          <Badge
                            variant={
                              inspection.inspection_result === 'ok'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {getInspectionLabel(
                              inspection.inspection_result
                            )}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* 車両情報 */}
                    {purchaseRecords.length > 0 && (
                      <div className="mb-4 pb-4 border-b border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                          車両情報（{purchaseRecords.length}台）
                        </p>
                        <div className="space-y-1">
                          {purchaseRecords.slice(0, 2).map((record, idx) => (
                            <p
                              key={record?.id || idx}
                              className="text-sm text-gray-700"
                            >
                              • {record?.vehicle_name} ({record?.year}年){' '}
                              <span className="text-blue-600 font-medium">
                                {formatCurrency(record?.bid_price || 0)}
                              </span>
                            </p>
                          ))}
                          {purchaseRecords.length > 2 && (
                            <p className="text-xs text-gray-500 mt-1">
                              他{purchaseRecords.length - 2}台
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 金額・アクション */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">台数</p>
                        <p className="text-sm font-medium text-gray-900">
                          {delivery.vehicle_count}台
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">合計金額</p>
                        <p className="text-sm font-bold text-gray-900">
                          {formatCurrency(delivery.total_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">検収状態</p>
                        <p className="text-sm font-medium text-gray-900">
                          {inspection
                            ? getInspectionLabel(
                                inspection.inspection_result
                              )
                            : '未実施'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Button variant="ghost" size="sm" className="w-full">
                          詳細 →
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