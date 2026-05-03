'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateJP } from '@/lib/utils';

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

interface Order {
  id: number;
  order_number: string;
}

interface PurchaseRecord {
  id: number;
  vehicle_name: string;
  maker?: string;
  year?: number;
  mileage?: number;
  bid_price: number;
}

interface Inspection {
  id: number;
  delivery_id: number;
  received_date?: string;
  inspection_date?: string;
  inspection_result: string;
  inspection_notes?: string;
}

export default function PortalDeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deliveryId = parseInt(params.id as string, 10);

  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // フォーム状態
  const [formData, setFormData] = useState({
    received_date: '',
    inspection_date: '',
    inspection_result: 'pending' as 'pending' | 'ok' | 'ng' | 'completed',
    inspection_notes: '',
  });

  // 納品書詳細を取得
  useEffect(() => {
    const fetchDeliveryDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`📋 納品書詳細を取得中: ID=${deliveryId}`);

        // 納品書を取得
        const deliveryRes = await fetch(`/api/deliveries/${deliveryId}`);
        const deliveryData = await deliveryRes.json();

        if (!deliveryData.success || !deliveryData.data) {
          throw new Error('納品書が見つかりません');
        }

        const deliveryInfo = deliveryData.data;
        setDelivery(deliveryInfo);

        // 受注を取得
        const orderRes = await fetch(`/api/orders/${deliveryInfo.order_id}`);
        const orderData = await orderRes.json();
        if (orderData.success) {
          setOrder(orderData.data);
        }

        // 仕入実績を取得
        const purchasesRes = await fetch(
          `/api/delivery-purchase-records/${deliveryInfo.id}`
        );
        const purchasesData = await purchasesRes.json();
        if (purchasesData.success) {
          setPurchaseRecords(purchasesData.data);
        }

        // 検収情報を取得
        const inspectionRes = await fetch(
          `/api/inspections?delivery_id=${deliveryInfo.id}`
        );
        const inspectionData = await inspectionRes.json();
        if (
          inspectionData.success &&
          inspectionData.data.inspection
        ) {
          const inspectionInfo = inspectionData.data.inspection;
          setInspection(inspectionInfo);

          // フォームに検収情報を設定
          setFormData({
            received_date: inspectionInfo.received_date || '',
            inspection_date: inspectionInfo.inspection_date || '',
            inspection_result: inspectionInfo.inspection_result || 'pending',
            inspection_notes: inspectionInfo.inspection_notes || '',
          });
        }

        console.log('✅ 詳細取得完了');
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

  // フォーム入力の変更
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 検収を送信
  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      console.log('🔄 検収結果を送信中...');
      console.log('📤 送信データ:', formData);

      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_id: deliveryId,
          ...formData,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || '検収結果の保存に失敗しました');
      }

      console.log(`✅ 検収結果保存成功 - ID: ${result.data.id}`);

      // 検収情報を更新
      setInspection({
        id: result.data.id,
        delivery_id: deliveryId,
        ...formData,
      });

      alert('検収結果が保存されました');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました';
      console.error('❌ 検収結果送信エラー:', errorMessage);
      alert(`エラー: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
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

  const getInspectionLabel = (result: string): string => {
    const labels: Record<string, string> = {
      pending: '未検収',
      ok: '良好',
      ng: '要確認',
      completed: '完了',
    };
    return labels[result] || '未検収';
  };

  const totalVehicleAmount = purchaseRecords.reduce(
    (sum, p) => sum + (p?.bid_price || 0),
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
        <Link href="/portal/deliveries">
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
          <Link href="/portal/deliveries">
            <Button variant="secondary">戻る</Button>
          </Link>
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
                <Badge variant="bg-blue-100 text-blue-800">
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
                  <p className="text-sm text-gray-600 mb-1">受注</p>
                  <p className="text-base text-gray-900">
                    {order?.order_number || '-'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 納品車両一覧 */}
          {purchaseRecords.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  納品車両一覧（{purchaseRecords.length}台）
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
                          <td className="py-3 px-3 text-gray-900 font-medium">
                            {purchase?.vehicle_name}
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

          {/* 検収フォーム */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  検収結果
                </h2>
                {inspection && (
                  <Badge
                    variant={
                      inspection.inspection_result === 'ok'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {getInspectionLabel(inspection.inspection_result)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmitInspection} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      受領日
                    </label>
                    <input
                      type="date"
                      name="received_date"
                      value={formData.received_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      検収日
                    </label>
                    <input
                      type="date"
                      name="inspection_date"
                      value={formData.inspection_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    検収結果 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="inspection_result"
                    value={formData.inspection_result}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">-- 選択してください --</option>
                    <option value="ok">良好</option>
                    <option value="ng">要確認</option>
                    <option value="completed">完了</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 納品内容が仕様通りであるか確認してください
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    検収コメント
                  </label>
                  <textarea
                    name="inspection_notes"
                    value={formData.inspection_notes}
                    onChange={handleInputChange}
                    placeholder="例：外装に傷あり、エンジンは正常..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 font-medium">
                    📋 検収フロー
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    1. 受領日を記入
                    <br />
                    2. 車両内容を確認
                    <br />
                    3. 検収結果を選択
                    <br />
                    4. 不具合があればコメントを記入
                  </p>
                </div>
              </form>
            </CardBody>
            <CardFooter className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                disabled={submitting}
                onClick={() => router.back()}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={submitting}
                disabled={submitting}
                onClick={handleSubmitInspection}
              >
                {submitting ? '保存中...' : '検収結果を保存'}
              </Button>
            </CardFooter>
          </Card>

          {/* 備考 */}
          {delivery.notes && (
            <Card className="mt-6">
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

        {/* 右サイドバー */}
        <div>
          {/* 金額情報 */}
          <Card className="sticky top-8 mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">金額情報</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">台数</span>
                  <span className="font-medium">{purchaseRecords.length}台</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">車両合計</span>
                  <span className="font-medium">
                    {formatCurrency(totalVehicleAmount)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">合計</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(delivery.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 検収状態 */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                検収状態
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {inspection ? (
                <>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">検収結果</p>
                    <Badge
                      variant={
                        inspection.inspection_result === 'ok'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {getInspectionLabel(inspection.inspection_result)}
                    </Badge>
                  </div>
                  {inspection.received_date && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">受領日</p>
                      <p className="text-base text-gray-900">
                        {formatDateJP(inspection.received_date)}
                      </p>
                    </div>
                  )}
                  {inspection.inspection_date && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">検収日</p>
                      <p className="text-base text-gray-900">
                        {formatDateJP(inspection.inspection_date)}
                      </p>
                    </div>
                  )}
                  {inspection.inspection_notes && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">
                        検収コメント
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {inspection.inspection_notes}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  検収結果がまだ記入されていません
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}