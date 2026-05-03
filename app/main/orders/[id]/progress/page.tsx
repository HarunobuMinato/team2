'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/card';
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
import { formatDateJP } from '@/lib/utils';
import { Order } from '@/types/order';

interface OrderProgress {
  id: number;
  order_id: number;
  status: string;
  changed_at: string;
  changed_by: number;
  notes: string | null;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default function OrderProgressPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [progress, setProgress] = useState<OrderProgress[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // データを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);

        // 受注データ取得
        const orderResponse = await fetch(`/api/orders/${orderId}`);
        const orderData = await orderResponse.json();

        if (!orderData.success) {
          setError('受注が見つかりません');
          setDataLoading(false);
          return;
        }

        const fetchedOrder = orderData.data;
        setOrder(fetchedOrder);
        setNewStatus(fetchedOrder.status);

        console.log('✅ 受注情報取得完了:', fetchedOrder);

        // 進捗履歴を取得
        try {
          const progressResponse = await fetch(
            `/api/orders/${orderId}/progress`
          );
          const progressData = await progressResponse.json();
          if (progressData.success) {
            setProgress(progressData.data || []);
            console.log('✅ 進捗履歴取得完了:', progressData.data?.length || 0, '件');
          }
        } catch (err) {
          console.warn('⚠️ 進捗履歴の取得に失敗:', err);
        }

        // 現在ユーザーの情報をセッションストレージから取得
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            setCurrentUser(user);
          } catch (err) {
            console.warn('⚠️ ユーザー情報の取得に失敗:', err);
          }
        }
      } catch (err) {
        console.error('❌ データ取得エラー:', err);
        setError('データの取得に失敗しました');
      } finally {
        setDataLoading(false);
      }
    };

    if (orderId) {
      fetchData();
    }
  }, [orderId]);

  // ステータスオプションを取得
  const getBuyStatusOptions = () => {
    return [
      { value: 'ordered', label: '受注済み' },
      { value: 'auction_processing', label: 'オークション手続中' },
      { value: 'purchase_recording', label: '仕入実績登録中' },
      { value: 'purchased', label: '仕入完了' },
      { value: 'shipment_preparing', label: '出荷準備中' },
      { value: 'shipping', label: '配送中' },
      { value: 'shipped', label: '配送完了' },
      { value: 'invoiced', label: '請求済み' },
      { value: 'partial_payment', label: '部分入金' },
      { value: 'payment_received', label: '入金完了' },
      { value: 'completed', label: '完了' },
    ];
  };

  const getSellStatusOptions = () => {
    return [
      { value: 'ordered', label: '受注済み' },
      { value: 'vehicle_received', label: '車両預かり中' },
      { value: 'auction_processing', label: 'オークション手続中' },
      { value: 'sold', label: '売却完了' },
      { value: 'payment_notified', label: '支払通知済み' },
      { value: 'payment_completed', label: '支払完了' },
      { value: 'completed', label: '完了' },
    ];
  };

  const getMediationStatusOptions = () => {
    return [
      { value: 'ordered', label: '受注済み' },
      { value: 'matching', label: 'マッチング中' },
      { value: 'deal_established', label: '取引成立' },
      { value: 'invoiced', label: '請求済み' },
      { value: 'payment_received', label: '入金完了' },
      { value: 'payment_notified', label: '支払通知済み' },
      { value: 'payment_completed', label: '支払完了' },
      { value: 'completed', label: '完了' },
    ];
  };

  const getStatusOptions = () => {
    if (!order) return [];
    if (order.order_type === 'sell') {
      return getSellStatusOptions();
    }
    if (order.order_type === 'mediation') {
      return getMediationStatusOptions();
    }
    return getBuyStatusOptions();
  };

  // ステータスラベルを取得
  const getStatusLabel = (status: string): string => {
    if (!order) return status;
    if (order.order_type === 'buy') {
      return BUY_ORDER_STATUS_LABELS[status as any] || status;
    }
    if (order.order_type === 'sell') {
      return SELL_ORDER_STATUS_LABELS[status as any] || status;
    }
    return MEDIATION_ORDER_STATUS_LABELS[status as any] || status;
  };

  // ステータスカラーを取得
  const getStatusColor = (status: string): string => {
    if (!order) return '';
    if (order.order_type === 'buy') {
      return BUY_ORDER_STATUS_COLORS[status as any] || '';
    }
    if (order.order_type === 'sell') {
      return SELL_ORDER_STATUS_COLORS[status as any] || '';
    }
    return MEDIATION_ORDER_STATUS_COLORS[status as any] || '';
  };

  // ステータス更新処理
  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStatus) {
      setError('新しいステータスを選択してください');
      return;
    }

    if (newStatus === order?.status) {
      setError('同じステータスに更新することはできません');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 ステータス更新処理開始:', {
        orderId,
        oldStatus: order?.status,
        newStatus,
        notes,
      });

      const response = await fetch(
        `/api/orders/${orderId}/update-status`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: newStatus,
            notes: notes || null,
            changed_by: currentUser?.id || 1,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'ステータス更新に失敗しました');
      }

      console.log('✅ ステータス更新成功');
      setSuccessMessage('ステータスを更新しました');

      // 2秒後に詳細画面にリダイレクト
      setTimeout(() => {
        router.push(`/main/orders/${orderId}`);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました';
      console.error('❌ ステータス更新エラー:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (dataLoading) {
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
        title="進捗管理"
        subtitle={`${order.order_number} のステータス更新`}
        actions={
          <Link href={`/main/orders/${orderId}`}>
            <Button variant="secondary">詳細に戻る</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ステータス更新フォーム */}
        <div className="lg:col-span-2">
          <form onSubmit={handleStatusUpdate}>
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  ステータス更新
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                {successMessage && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700">✓ {successMessage}</p>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">❌ {error}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-2">現在のステータス</p>
                  <div className="inline-block">
                    <Badge variant={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </div>

                <Select
                  label="新しいステータス"
                  options={getStatusOptions()}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                />

                <Input
                  label="備考（更新理由など）"
                  type="text"
                  placeholder="この更新について何か記入してください"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    💡 ステータス更新時の注意：
                    <br />
                    買い注文の場合、「仕入実績登録中」→「出荷準備中」の順で進めてください。
                  </p>
                </div>
              </CardBody>
              <CardFooter className="flex gap-3 justify-end">
                <Link href={`/main/orders/${orderId}`}>
                  <Button variant="secondary" type="button">
                    キャンセル
                  </Button>
                </Link>
                <Button variant="primary" type="submit" isLoading={isLoading}>
                  ステータスを更新
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        {/* 進捗履歴 */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">進捗履歴</h2>
            </CardHeader>
            <CardBody>
              {progress.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  進捗履歴がありません
                </p>
              ) : (
                <div className="space-y-4">
                  {progress.map((p) => (
                    <div
                      key={p.id}
                      className="pb-4 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 mt-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {getStatusLabel(p.status)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDateJP(p.changed_at)}
                          </p>
                          {p.notes && (
                            <p className="text-sm text-gray-600 mt-1">{p.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}