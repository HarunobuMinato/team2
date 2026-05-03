'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateJP } from '@/lib/utils';
import { json } from 'stream/consumers';

interface ShipmentFormProps {
  orderId?: string;
  onSubmit: (formData: any) => void;
  isLoading?: boolean;
}

interface Order {
  id: number;
  order_number: string;
  order_date: string;
  client_id: number;
}

interface Client {
  id: number;
  name: string;
}

interface PurchaseRecord {
  id: number;
  vehicle_name: string;
  maker?: string;
  model?: string;
  year?: number;
  mileage?: number;
  bid_price: number;
}

interface TransportCompany {
  id: number;
  name: string;
}

interface SelectedPurchaseRecord extends PurchaseRecord {
  checked: boolean;
}

export function ShipmentForm({
  orderId,
  onSubmit,
  isLoading = false,
}: ShipmentFormProps) {
  const [formData, setFormData] = useState({
    orderId: orderId || '',
    shipmentDate: new Date().toISOString().split('T')[0],
    pickupDate: '',
    deliveryDate: '',
    transportCompanyId: '',
    transportCost: '',
    transportNotes: '',
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [transportCompanies, setTransportCompanies] = useState<TransportCompany[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [availablePurchaseRecords, setAvailablePurchaseRecords] = useState<
    SelectedPurchaseRecord[]
  >([]);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [totalVehicleAmount, setTotalVehicleAmount] = useState(0);
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

        // 陸送業者取得
        try {
          const companiesRes = await fetch('/api/transport-companies');
          const companiesData = await companiesRes.json();
          if (companiesData.success) {
            setTransportCompanies(companiesData.data || []);
            console.log('✅ 陸送業者取得完了:', companiesData.data?.length || 0, '件');
          }
        } catch (err) {
          console.warn('⚠️ 陸送業者データ取得失敗');
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


    const order = orders.find((o) => {
      return String(o.id) === String(id);
    });
    if (order) {
      setSelectedOrder(order);


      // その受注に紐づく仕入実績を取得
      try {
        console.log(`🔄 受注 ${id} の仕入実績を取得中...`);
        const response = await fetch(`/api/purchase-records?order_id=${id}`);
        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          const purchaseRecords: SelectedPurchaseRecord[] = data.data.map(
            (p: any) => ({
              id: p.id,
              vehicle_name: p.vehicle_name,
              maker: p.maker,
              model: p.model,
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
  const handlePurchaseRecordToggle = (purchaseRecordId: number) => {
    setAvailablePurchaseRecords((prev) =>
      prev.map((p) =>
        p.id === purchaseRecordId
          ? { ...p, checked: !p.checked }
          : p
      )
    );
  };

  // 台数と合計金額の計算
  useEffect(() => {
    const selectedRecords = availablePurchaseRecords.filter((p) => p.checked);
    setTotalVehicles(selectedRecords.length);
    setTotalVehicleAmount(
      selectedRecords.reduce((sum, p) => sum + p.bid_price, 0)
    );
  }, [availablePurchaseRecords]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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

    const selectedRecords = availablePurchaseRecords.filter((p) => p.checked);
    if (selectedRecords.length === 0) {
      setError('1台以上の車両を選択してください');
      return;
    }

    if (!formData.shipmentDate) {
      setError('出荷日は必須です');
      return;
    }

    if (!formData.transportCompanyId) {
      setError('陸送業者は必須です');
      return;
    }

    if (!formData.transportCost) {
      setError('陸送費用は必須です');
      return;
    }

    onSubmit({
      order_id: parseInt(formData.orderId, 10),
      shipment_date: formData.shipmentDate,
      pickup_date: formData.pickupDate || null,
      delivery_date: formData.deliveryDate || null,
      transport_company_id: parseInt(formData.transportCompanyId, 10),
      transport_cost: parseFloat(formData.transportCost),
      transport_notes: formData.transportNotes || null,
      selected_purchase_record_ids: selectedRecords.map((p) => p.id),
      vehicle_count: totalVehicles,
      total_vehicle_amount: totalVehicleAmount,
    });
  };

  const transportCompanyOptions = transportCompanies.map((tc) => ({
    value: tc.id.toString(),
    label: tc.name,
  }));

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
              </>
            )}
          </div>
        </CardBody>
      </Card>

      {/* 出荷車両選択 */}
      {availablePurchaseRecords.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                出荷車両選択
              </h2>
              <Badge variant="bg-blue-100 text-blue-800">
                {totalVehicles}台選択中（合計{' '}
                {formatCurrency(totalVehicleAmount)}）
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
                    onChange={() =>
                      handlePurchaseRecordToggle(record.id)
                    }
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
                          {record.maker} {record.model} | {record.year || '-'}年
                          | {record.mileage ? `${record.mileage.toLocaleString()}km` : '-'}
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
          </CardBody>
        </Card>
      )}

      {availablePurchaseRecords.length === 0 && formData.orderId && (
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <p className="text-gray-500">
                この受注に紐づく仕入実績がありません
              </p>
              <p className="text-xs text-gray-400 mt-2">
                受注の仕入実績を先に登録してください
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* 出荷情報 */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">出荷情報</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                出荷日 <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                name="shipmentDate"
                value={formData.shipmentDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                集荷日
              </label>
              <Input
                type="date"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                配送予定日
              </label>
              <Input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 陸送情報 */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">陸送情報</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                陸送業者 <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.transportCompanyId}
                onChange={handleInputChange}
                name="transportCompanyId"
                required
                placeholder="選択してください"
                options={transportCompanyOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                陸送費用 <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="transportCost"
                placeholder="例：80000"
                value={formData.transportCost}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                特記事項
              </label>
              <textarea
                name="transportNotes"
                placeholder="例：指定時間帯、特別な指示など"
                value={formData.transportNotes}
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
            {isLoading ? '登録中...' : '出荷を登録'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}