'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';

interface Order {
  id: number;
  order_number: string;
  order_type: string;
  client_id: number;
}

interface Client {
  id: number;
  name: string;
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
}

interface AuctionVenue {
  id: number;
  name: string;
}

export default function PurchaseRecordNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [formData, setFormData] = useState({
    orderId: orderId || '',
    desiredVehicleId: '',
    auctionDate: new Date().toISOString().split('T')[0],
    auctionVenueId: '',
    vehicleName: '',
    maker: '',
    model: '',
    year: '',
    mileage: '',
    inspectionDate: '',
    color: '',
    chassisNumber: '',
    registrationNumber: '',
    // 【修正】金額情報を正確な名前に変更
    bidPrice: '', // 落札車両代金
    taxAmount: '', // 自動車税
    bidFee: '', // 成約落札料
    varianceReason: '',
    notes: '',
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [desiredVehicles, setDesiredVehicles] = useState<DesiredVehicle[]>([]);
  const [auctionVenues, setAuctionVenues] = useState<AuctionVenue[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDesiredVehicle, setSelectedDesiredVehicle] =
    useState<DesiredVehicle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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

        // オークション会場取得（エンドポイントがある場合）
        try {
          const venuesRes = await fetch('/api/auction-venues');
          const venuesData = await venuesRes.json();
          if (venuesData.success) {
            setAuctionVenues(venuesData.data || []);
            console.log('✅ オークション会場取得完了:', venuesData.data?.length || 0, '件');
          }
        } catch (err) {
          console.warn('⚠️ オークション会場データ取得失敗');
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
    const id = e.target.value;
    setFormData((prev) => ({
      ...prev,
      orderId: id,
      desiredVehicleId: '',
    }));

    const order = orders.find((o) => o.id.toString() === id);
    setSelectedOrder(order || null);
    setSelectedDesiredVehicle(null);

    // 希望車両を取得
    if (id) {
      try {
        const response = await fetch(`/api/desired-vehicles?order_id=${id}`);
        const data = await response.json();
        if (data.success) {
          setDesiredVehicles(data.data || []);
          console.log('✅ 希望車両取得完了:', data.data?.length || 0, '件');
        }
      } catch (err) {
        console.warn('⚠️ 希望車両取得エラー:', err);
      }
    }
  };

  // 希望車両変更時の処理
  const handleDesiredVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setFormData((prev) => ({
      ...prev,
      desiredVehicleId: id,
    }));

    const desired = desiredVehicles.find((v) => v.id.toString() === id);
    if (desired) {
      setSelectedDesiredVehicle(desired);
      // 希望車両の情報を初期値として設定
      setFormData((prev) => ({
        ...prev,
        vehicleName: desired.vehicle_name,
        maker: desired.maker || '',
        model: desired.model || '',
        color: desired.color || '',
      }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 【修正】合計金額を計算
  const calculateTotal = () => {
    const bidPrice = parseFloat(formData.bidPrice) || 0;
    const taxAmount = parseFloat(formData.taxAmount) || 0;
    const bidFee = parseFloat(formData.bidFee) || 0;

    return bidPrice + taxAmount + bidFee;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // バリデーション
      if (!formData.orderId || !formData.vehicleName || !formData.bidPrice) {
        setError('受注、車種名、落札価格は必須です');
        setIsLoading(false);
        return;
      }

      console.log('🔄 仕入実績登録処理開始');

      // 【修正】APIに送信するデータを調整
      const purchaseRecordData = {
        order_id: parseInt(formData.orderId),
        desired_vehicle_id: formData.desiredVehicleId
          ? parseInt(formData.desiredVehicleId)
          : null,
        sequence_number: 1,
        auction_date: formData.auctionDate,
        vehicle_name: formData.vehicleName,
        maker: formData.maker || null,
        model: formData.model || null,
        year: formData.year ? parseInt(formData.year) : null,
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        inspection_date: formData.inspectionDate || null,
        color: formData.color || null,
        chassis_number: formData.chassisNumber || null,
        registration_number: formData.registrationNumber || null,
        bid_price: parseFloat(formData.bidPrice),
        tax_amount: formData.taxAmount ? parseFloat(formData.taxAmount) : 0,
        bid_fee: formData.bidFee ? parseFloat(formData.bidFee) : 0,
        variance_reason: formData.varianceReason || null,
        notes: formData.notes || null,
        status: 'recorded',
      };

      console.log('📤 送信するデータ:', purchaseRecordData);

      const response = await fetch('/api/purchase-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseRecordData),
      });

      const result = await response.json();

      console.log('📩 レスポンス:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || '仕入実績の登録に失敗しました');
      }

      console.log('✅ 仕入実績登録成功 - ID:', result.data?.id);
      setSuccessMessage('仕入実績を登録しました');

      // 2秒後に一覧にリダイレクト
      setTimeout(() => {
        router.push('/main/purchases');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました';
      console.error('❌ エラー:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // オークション会場オプション
  const auctionVenueOptions = auctionVenues.map((venue) => ({
    value: venue.id.toString(),
    label: venue.name,
  }));

  // 受注オプション
  const orderOptions = orders.map((order) => {
    const client = clients.find((c) => c.id === order.client_id);
    return {
      value: order.id.toString(),
      label: `${order.order_number} - ${client?.name || ''}`,
    };
  });

  // 希望車両オプション
  const desiredVehicleOptions = desiredVehicles.map((vehicle) => ({
    value: vehicle.id.toString(),
    label: `${vehicle.vehicle_name}${vehicle.maker ? ` (${vehicle.maker})` : ''}`,
  }));

  return (
    <div>
      <PageHeader
        title="仕入実績登録"
        subtitle="オークションで落札した車両の実績情報を登録"
        actions={
          <Link href="/main/vehicles/purchase">
            <Button variant="secondary">戻る</Button>
          </Link>
        }
      />

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">✓ {successMessage}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">❌ {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 受注・希望車両情報 */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              受注・希望車両情報
            </h2>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    顧客名
                  </label>
                  <div className="px-3 py-2 bg-gray-100 rounded text-sm text-gray-700">
                    {clients.find((c) => c.id === selectedOrder.client_id)?.name}
                  </div>
                </div>
              )}

              {desiredVehicleOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    対応する希望車両
                  </label>
                  <Select
                    value={formData.desiredVehicleId}
                    onChange={handleDesiredVehicleChange}
                    placeholder="選択してください（オプション）"
                    options={desiredVehicleOptions}
                  />
                </div>
              )}
            </div>

            {selectedDesiredVehicle && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-700 mb-2">
                  💡 希望仕様（参考）
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-700">
                  <div>
                    <p className="font-medium">年式</p>
                    <p>
                      {selectedDesiredVehicle.desired_year_from}～
                      {selectedDesiredVehicle.desired_year_to}年
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">走行距離</p>
                    <p>
                      {selectedDesiredVehicle.desired_mileage_max}km以下
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">色</p>
                    <p>{selectedDesiredVehicle.color || '-'}</p>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* オークション情報 */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              オークション情報
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  落札日 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="auctionDate"
                  value={formData.auctionDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  オークション会場
                </label>
                <Select
                  value={formData.auctionVenueId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      auctionVenueId: e.target.value,
                    }))
                  }
                  placeholder="選択してください"
                  options={auctionVenueOptions}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 車両情報 */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">車両情報</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  車種名 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="vehicleName"
                  placeholder="例：セルシオ"
                  value={formData.vehicleName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メーカー
                </label>
                <Input
                  type="text"
                  name="maker"
                  placeholder="例：トヨタ"
                  value={formData.maker}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  型式
                </label>
                <Input
                  type="text"
                  name="model"
                  placeholder="例：GRX120"
                  value={formData.model}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  年式
                </label>
                <Input
                  type="number"
                  name="year"
                  placeholder="例：2023"
                  value={formData.year}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  走行距離（km）
                </label>
                <Input
                  type="number"
                  name="mileage"
                  placeholder="例：25000"
                  value={formData.mileage}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  車検期限
                </label>
                <Input
                  type="date"
                  name="inspectionDate"
                  value={formData.inspectionDate}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  色
                </label>
                <Input
                  type="text"
                  name="color"
                  placeholder="例：シルバー"
                  value={formData.color}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  車台番号
                </label>
                <Input
                  type="text"
                  name="chassisNumber"
                  placeholder="例：XXXXXXXXXXXXXXX"
                  value={formData.chassisNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  登録番号
                </label>
                <Input
                  type="text"
                  name="registrationNumber"
                  placeholder="例：東京501あ1234"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 【修正】金額情報 - 落札車両代金、自動車税、成約落札料 */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">金額情報</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  落札車両代金 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="bidPrice"
                  placeholder="例：1500000"
                  value={formData.bidPrice}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">オークションでの落札価格</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  自動車税
                </label>
                <Input
                  type="number"
                  name="taxAmount"
                  placeholder="例：50000"
                  value={formData.taxAmount}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-gray-500 mt-1">自動車税相当分</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  成約落札料
                </label>
                <Input
                  type="number"
                  name="bidFee"
                  placeholder="例：100000"
                  value={formData.bidFee}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-gray-500 mt-1">オークション会場の手数料</p>
              </div>
            </div>

            {/* 【修正】合計金額表示 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">落札車両代金</span>
                  <span className="font-semibold">
                    ¥{parseFloat(formData.bidPrice || '0').toLocaleString()}
                  </span>
                </div>
                {formData.taxAmount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">自動車税</span>
                    <span className="font-semibold">
                      ¥{parseFloat(formData.taxAmount).toLocaleString()}
                    </span>
                  </div>
                )}
                {formData.bidFee && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">成約落札料</span>
                    <span className="font-semibold">
                      ¥{parseFloat(formData.bidFee).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="border-t border-blue-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">合計金額</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ¥{calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 差分・備考 */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              差分・備考
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                希望との差分理由
              </label>
              <textarea
                name="varianceReason"
                rows={2}
                placeholder="希望と異なる点があれば記入してください"
                value={formData.varianceReason}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                備考
              </label>
              <textarea
                name="notes"
                rows={2}
                placeholder="その他の備考"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </CardBody>
        </Card>

        {/* ボタン */}
        <Card>
          <CardFooter className="flex gap-3 justify-end">
            <Link href="/main/vehicles/purchase">
              <Button type="button" variant="secondary" disabled={isLoading}>
                キャンセル
              </Button>
            </Link>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {isLoading ? '登録中...' : '仕入実績を登録'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}