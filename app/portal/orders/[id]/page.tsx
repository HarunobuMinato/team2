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
} from '@/constants/status';
import { formatCurrency, formatDateJP } from '@/lib/utils';

interface Order {
  id: number;
  order_number: string;
  order_type: 'buy' | 'sell' | 'mediation';
  status: string;
  order_date: string;
  desired_delivery_date: string | null;
  vehicle_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface PurchaseRecord {
  id: number;
  sequence_number: number;
  vehicle_name: string;
  maker: string | null;
  model: string | null;
  year: number | null;
  mileage: number | null;
  color: string | null;
  body_color: string | null;
  transmission: string | null;
  engine: string | null;
  auction_date: string;
  bid_price: number;
  bid_date: string | null;
  total_purchase_price: number;
  status: string;
}

interface OrderProgress {
  id: number;
  status: string;
  changed_at: string;
  notes: string | null;
}

export default function PortalOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);
  const [progress, setProgress] = useState<OrderProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  // 受注情報を取得
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) throw new Error('受注情報の取得に失敗しました');

        const data = await response.json();
        if (data.success) {
          setOrder(data.data);
        } else {
          setError(data.error || '受注情報の取得に失敗しました');
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError(err instanceof Error ? err.message : '受注情報の取得に失敗しました');
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // 仕入実績を取得
  useEffect(() => {
    const fetchPurchaseRecords = async () => {
      try {
        const response = await fetch(`/api/purchase-records/by-order/${orderId}`);
        if (!response.ok) throw new Error('仕入実績の取得に失敗しました');

        const data = await response.json();
        if (data.success) {
          setPurchaseRecords(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch purchase records:', err);
      }
    };

    if (orderId) {
      fetchPurchaseRecords();
    }
  }, [orderId]);

  // 進捗履歴を取得
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}/progress`);
        if (!response.ok) throw new Error('進捗情報の取得に失敗しました');

        const data = await response.json();
        if (data.success) {
          setProgress(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch progress:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchProgress();
    }
  }, [orderId]);

  /**
   * 受注確認ボタンの処理
   */
  const handleConfirmOrder = async () => {
    if (!order) return;

    setIsConfirming(true);
    setConfirmError(null);
    setConfirmSuccess(false);

    try {
      const response = await fetch(`/api/orders/${order.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: '顧客が受注を確認しました' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '受注確認に失敗しました');
      }

      const result = await response.json();

      // ステータスを更新
      setOrder({ ...order, status: 'ordered' });
      setConfirmSuccess(true);

      // 進捗を追加
      const newProgress: OrderProgress = {
        id: Math.max(...progress.map(p => p.id), 0) + 1,
        status: 'ordered',
        changed_at: new Date().toISOString(),
        notes: '顧客が受注を確認しました',
      };
      setProgress([...progress, newProgress]);

      // メッセージを3秒後に消す
      setTimeout(() => setConfirmSuccess(false), 3000);

      console.log('✅ 受注確認成功:', result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setConfirmError(message);
      console.error('❌ 受注確認エラー:', err);
    } finally {
      setIsConfirming(false);
    }
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
        <p className="text-gray-500 text-lg mb-4">注文が見つかりません</p>
        <Link href="/portal/orders">
          <Button>注文一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="注文詳細"
        subtitle={order.order_number}
        actions={
          <Link href="/portal/orders">
            <Button variant="secondary">戻る</Button>
          </Link>
        }
      />

      {confirmSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 font-medium">
            ✅ 受注を確認しました。ステータスが「受注済み」に更新されました。
          </p>
        </div>
      )}

      {confirmError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">❌ {confirmError}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">❌ {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2">
          {/* 受注確認セクション */}
          {order.status === 'order_pending' && (
            <Card className="mb-6 border-2 border-yellow-400 bg-yellow-50">
              <CardHeader className="bg-yellow-100">
                <h2 className="text-lg font-semibold text-yellow-900">
                  🔔 受注確認が必要です
                </h2>
              </CardHeader>
              <CardBody>
                <p className="text-yellow-800 mb-4">
                  この受注は確認待ちの状態です。下のボタンをクリックして受注を確認してください。
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleConfirmOrder}
                    disabled={isConfirming}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    {isConfirming ? '確認中...' : '✓ 受注を確認する'}
                  </Button>
                  <p className="text-sm text-yellow-700 flex items-center">
                    ※ 確認すると、当社がこの注文の処理を開始します
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {/* 注文情報 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">注文情報</h2>
                <Badge variant={BUY_ORDER_STATUS_COLORS[order.status as any]}>
                  {BUY_ORDER_STATUS_LABELS[order.status as any]}
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">注文番号</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {order.order_number}
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
                <div>
                  <p className="text-sm text-gray-600 mb-1">注文種別</p>
                  <p className="text-base text-gray-900">
                    {order.order_type === 'buy' ? '買い注文' : order.order_type === 'sell' ? '売り注文' : '仲介売買'}
                  </p>
                </div>
              </div>

              {order.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">備考</p>
                  <p className="text-gray-700">{order.notes}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* 車両情報セクション */}
          {purchaseRecords.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  車両情報（{purchaseRecords.length}台）
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {purchaseRecords.map((record, idx) => (
                    <div
                      key={record.id}
                      className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">
                            車種・型式
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {record.vehicle_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">年式</p>
                          <p className="text-base font-medium text-gray-900">
                            {record.year || '-'}年
                          </p>
                        </div>
                      </div>

                      {/* 詳細情報グリッド */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 pb-3 border-b border-gray-200">
                        <div>
                          <p className="text-xs text-gray-600 mb-0.5">
                            走行距離
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {record.mileage?.toLocaleString() || '-'}km
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-0.5">ボディ</p>
                          <p className="text-sm font-medium text-gray-900">
                            {record.body_color || record.color || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-0.5">
                            トランスミッション
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {record.transmission || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-0.5">
                            エンジン
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {record.engine || '-'}
                          </p>
                        </div>
                      </div>

                      {/* 落札情報 */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-gray-600 mb-0.5">
                            落札価格
                          </p>
                          <p className="text-lg font-bold text-blue-600">
                            {formatCurrency(record.bid_price)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-0.5">
                            落札日
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {record.bid_date
                              ? formatDateJP(record.bid_date)
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-0.5">
                            ステータス
                          </p>
                          <Badge variant="bg-blue-100 text-blue-800">
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 合計情報 */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        落札合計
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(
                          purchaseRecords.reduce(
                            (sum, r) => sum + r.bid_price,
                            0
                          )
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">台数</p>
                      <p className="text-lg font-bold text-gray-900">
                        {purchaseRecords.length}台
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        仕入総額
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(
                          purchaseRecords.reduce(
                            (sum, r) => sum + r.total_purchase_price,
                            0
                          )
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* 進捗状況 */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">進捗状況</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {progress.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    進捗情報がまだありません
                  </p>
                ) : (
                  <>
                    <div className="space-y-4">
                      {progress.map((p, index) => (
                        <div key={p.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-4 h-4 rounded-full bg-blue-600 flex-shrink-0" />
                            {index < progress.length - 1 && (
                              <div className="w-1 h-12 bg-blue-200 my-1" />
                            )}
                          </div>
                          <div className="pb-4">
                            <p className="font-medium text-gray-900">
                              {BUY_ORDER_STATUS_LABELS[p.status as any] || p.status}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDateJP(p.changed_at)}
                            </p>
                            {p.notes && (
                              <p className="text-sm text-gray-600 mt-1">
                                {p.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.status !== 'completed' && (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          📌 次のステップ
                        </p>
                        <p className="text-sm text-blue-700">
                          {order.status === 'order_pending' &&
                            '受注を確認すると、当社がオークションでの入札を開始します'}
                          {order.status === 'ordered' &&
                            'オークションでの入札を開始します'}
                          {order.status === 'auction_processing' &&
                            '落札・計算書受領・代金支払いを実行します'}
                          {order.status === 'purchased' &&
                            '納品書の確認をお願いします'}
                          {order.status === 'invoiced' &&
                            '請求書をご確認ください'}
                          {order.status === 'payment_received' &&
                            '手続きの完了間近です'}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 右サイドバー - 金額情報 */}
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">金額情報</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {purchaseRecords.length > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">落札合計</span>
                      <span className="font-medium">
                        {formatCurrency(
                          purchaseRecords.reduce(
                            (sum, r) => sum + r.bid_price,
                            0
                          )
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">追加費用</span>
                      <span className="font-medium">
                        {formatCurrency(
                          purchaseRecords.reduce(
                            (sum, r) => sum + (r.tax_amount || 0) + (r.bid_fee || 0),
                            0
                          )
                        )}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">
                          仕入総額
                        </span>
                        <span className="text-xl font-bold text-blue-600">
                          {formatCurrency(
                            purchaseRecords.reduce(
                              (sum, r) => sum + r.total_purchase_price,
                              0
                            )
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                        台数別
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">台数</span>
                          <span className="font-medium">
                            {purchaseRecords.length}台
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">平均落札価格</span>
                          <span className="font-medium">
                            {formatCurrency(
                              purchaseRecords.reduce(
                                (sum, r) => sum + r.bid_price,
                                0
                              ) / purchaseRecords.length
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ステータス別の進捗 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-600 font-semibold mb-2">
                  進捗：
                  {order.status === 'completed'
                    ? 'すべての手続きが完了しました'
                    : `${Math.round(
                        (
                          [
                            'order_pending',
                            'ordered',
                            'auction_processing',
                            'purchased',
                            'invoiced',
                            'payment_received',
                            'completed',
                          ].indexOf(order.status) + 1
                        ) / 7
                      ) * 100}%`}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        {
                          order_pending: '14%',
                          ordered: '29%',
                          auction_processing: '43%',
                          purchased: '57%',
                          invoiced: '71%',
                          payment_received: '86%',
                          completed: '100%',
                        }[order.status] || '0%'
                      }`,
                    }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}