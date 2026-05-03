'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateJP } from '@/lib/utils';

interface DeliveryFormProps {
  orderId?: string;
  onSubmit: (formData: any) => void;
  isLoading?: boolean;
}

interface Order {
  id: number;
  order_number: string;
  order_date: string;
  client_id: number;
  total_amount: number;
}

interface Client {
  id: number;
  name: string;
}

interface PurchaseRecord {
  id: number;
  vehicle_name: string;
  year?: number;
  mileage?: number;
  bid_price: number;
}

interface SelectablePurchaseRecord extends PurchaseRecord {
  checked: boolean;
}

export function DeliveryForm({
  orderId,
  onSubmit,
  isLoading = false,
}: DeliveryFormProps) {
  const [formData, setFormData] = useState({
    orderId: orderId || '',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryLocation: '',
    notes: '',
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [availablePurchaseRecords, setAvailablePurchaseRecords] = useState<
    SelectablePurchaseRecord[]
  >([]);
  const [selectedPurchases, setSelectedPurchases] = useState<
    SelectablePurchaseRecord[]
  >([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // マスターデータを取得
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        console.log('🔄 マスターデータ取得中...');

        // 買い注文を取得
        const ordersRes = await fetch('/api/orders?order_type=buy');
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setOrders(ordersData.data || []);
          console.log('✅ 受注取得完了:', ordersData.data?.length || 0, '件');
        }

        // クライアント取得
        const clientsRes = await fetch('/api/clients');
        const clientsData = await clientsRes.json();
        if (clientsData.success) {
          setClients(clientsData.data || []);
        }
      } catch (err) {
        console.error('❌ マスターデータ取得エラー:', err);
        setError('マスターデータの取得に失敗しました');
      }
    };

    fetchMasterData();
  }, []);

  // 受注変更時の処理
  const handleOrderChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    setFormData((prev) => ({ ...prev, orderId: id.toString() }));

    const order = orders.find((o: Order) => Number(o.id) === Number(id));
    if (order) {
      setSelectedOrder(order);

      // その受注に紐づく「登録済み」の仕入実績を取得
      try {
        console.log(`🔄 受注 ${id} の仕入実績を取得中...`);
        const response = await fetch(
          `/api/purchase-records?order_id=${id}&status=recorded`
        );
        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          const purchaseRecords: SelectablePurchaseRecord[] = data.data.map(
            (p: any) => ({
              id: p.id,
              vehicle_name: p.vehicle_name,
              year: p.year,
              mileage: p.mileage,
              bid_price: p.bid_price,
              checked: false,
            })
          );
          setAvailablePurchaseRecords(purchaseRecords);
          console.log('✅ 仕入実績取得完了:', purchaseRecords.length, '件');
        }
      } catch (err) {
        console.warn('⚠️ 仕入実績取得エラー:', err);
        setAvailablePurchaseRecords([]);
      }
    }
  };

  // 仕入実績の選択/解除
  const handlePurchaseToggle = (purchaseRecordId: number) => {
    const updated = availablePurchaseRecords.map((p) =>
      p.id === purchaseRecordId
        ? { ...p, checked: !p.checked }
        : p
    );
    setAvailablePurchaseRecords(updated);

    const selected = updated.filter((p) => p.checked);
    setSelectedPurchases(selected);
  };

  // 合計金額の計算
  useEffect(() => {
    const total = selectedPurchases.reduce(
      (sum, p) => sum + Number(p.bid_price),
      0
    );
    setTotalAmount(total);
  }, [selectedPurchases]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.orderId) {
      setError('受注は必須です');
      return;
    }

    if (selectedPurchases.length === 0) {
      setError('1台以上の車両を選択してください');
      return;
    }

    if (!formData.deliveryDate) {
      setError('納品日は必須です');
      return;
    }

    onSubmit({
      order_id: parseInt(formData.orderId, 10),
      delivery_date: formData.deliveryDate,
      delivery_location: formData.deliveryLocation || null,
      notes: formData.notes || null,
      selected_purchase_record_ids: selectedPurchases.map((p) => p.id),
      vehicle_count: selectedPurchases.length,
      total_amount: totalAmount,
    });
  };

  const orderOptions = orders.map((order) => {
    const client = clients.find((c) => c.id === order.client_id);
    return {
      value: order.id.toString(),
      label: `${order.order_number} - ${client?.name || ''}`,
    };
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">❌ {error}</p>
        </div>
      )}

      {/* 受注情報 */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">受注情報</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                受注番号 <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.orderId}
                onChange={handleOrderChange}
                required
                placeholder="選択してください"
                options={orderOptions}
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 買い注文の受注を選択してください
              </p>
            </div>

            {selectedOrder && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    顧客名
                  </label>
                  <div className="px-3 py-2 bg-gray-100 rounded text-sm text-gray-700">
                    {
                      clients.find((c) => c.id === selectedOrder.client_id)
                        ?.name
                    }
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    受注日
                  </label>
                  <div className="px-3 py-2 bg-gray-100 rounded text-sm text-gray-700">
                    {formatDateJP(selectedOrder.order_date)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    受注金額
                  </label>
                  <div className="px-3 py-2 bg-gray-100 rounded text-sm text-gray-700 font-medium">
                    {formatCurrency(selectedOrder.total_amount)}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardBody>
      </Card>

      {/* 納品車両選択 */}
      {availablePurchaseRecords.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                納品車両選択
              </h2>
              <Badge variant="bg-blue-100 text-blue-800">
                {selectedPurchases.length}台選択中（合計{' '}
                {formatCurrency(totalAmount)}）
              </Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {availablePurchaseRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    id={`purchase-${record.id}`}
                    checked={record.checked}
                    onChange={() => handlePurchaseToggle(record.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <label
                    htmlFor={`purchase-${record.id}`}
                    className="ml-3 flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {record.vehicle_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {record.year || '-'}年 |{' '}
                          {record.mileage
                            ? `${record.mileage.toLocaleString()}km`
                            : '-'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(record.bid_price)}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700 font-medium">
                💡 ステータス「登録済み」の仕入実績のみが表示されます
              </p>
              <p className="text-xs text-blue-600 mt-1">
                社員が持ち帰った車両や、在庫にある納品待ちの車両が対象です
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {availablePurchaseRecords.length === 0 && formData.orderId && (
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <p className="text-gray-500">
                この受注に紐づく納品可能な仕入実績がありません
              </p>
              <p className="text-xs text-gray-400 mt-2">
                仕入実績が「登録済み」ステータスになっている必要があります
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* 納品情報 */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">納品情報</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                納品日 <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                納品場所
              </label>
              <Input
                type="text"
                name="deliveryLocation"
                placeholder="例：顧客指定住所、当社ガレージ"
                value={formData.deliveryLocation}
                onChange={handleInputChange}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                備考
              </label>
              <textarea
                name="notes"
                placeholder="例：特別な注記事項など"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 送信ボタン */}
      <Card>
        <CardFooter className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" disabled={isLoading}>
            キャンセル
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isLoading ? '作成中...' : '納品書を作成'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}