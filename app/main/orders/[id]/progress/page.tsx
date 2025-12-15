'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { mockOrders } from '@/data/orders';
import { mockOrderProgress } from '@/data/order-progress';
import { mockUsers } from '@/data/users';
import {
  BUY_ORDER_STATUS_LABELS,
  BUY_ORDER_STATUS_COLORS,
} from '@/constants/status';
import { formatDateJP } from '@/lib/utils';

export default function OrderProgressPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const order = mockOrders.find((o) => o.id === orderId);
  const progress = mockOrderProgress.filter((p) => p.orderId === orderId);

  const [newStatus, setNewStatus] = React.useState(order?.status || '');
  const [notes, setNotes] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');

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

  // 買い注文ステータスオプション
  const buyStatusOptions = [
    { value: 'ordered', label: '受注済み' },
    { value: 'auction_processing', label: 'オークション手続中' },
    { value: 'purchased', label: '仕入完了' },
    { value: 'invoiced', label: '請求済み' },
    { value: 'payment_received', label: '入金完了' },
    { value: 'completed', label: '完了' },
  ];

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // バックエンド実装時のシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('ステータス更新:', {
        orderId,
        newStatus,
        notes,
        changedBy: 'user-002',
        changedAt: new Date(),
      });

      setSuccessMessage('ステータスを更新しました');

      // 2秒後に詳細画面にリダイレクト
      setTimeout(() => {
        router.push(`/orders/${orderId}`);
      }, 2000);
    } catch (error) {
      console.error('エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentUser = mockUsers.find((u) => u.role === 'sales');

  return (
    <div>
      <PageHeader
        title="進捗管理"
        subtitle={`${order.orderNumber} のステータス更新`}
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

                <div>
                  <p className="text-sm text-gray-600 mb-2">現在のステータス</p>
                  <div className="inline-block">
                    <Badge variant={BUY_ORDER_STATUS_COLORS[order.status as any]}>
                      {BUY_ORDER_STATUS_LABELS[order.status as any]}
                    </Badge>
                  </div>
                </div>

                <Select
                  label="新しいステータス"
                  options={buyStatusOptions}
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
                            {BUY_ORDER_STATUS_LABELS[p.status as any]}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDateJP(p.changedAt)}
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