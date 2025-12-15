// ========================================
// 3. PurchaseForm - 更新版
// ========================================
'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { mockOrders } from '@/data/orders';
import { mockClients } from '@/data/clients';

interface PurchaseFormProps {
  orderId?: string;
  onSubmit: (formData: any) => void;
  isLoading?: boolean;
}

export function PurchaseForm({
  orderId,
  onSubmit,
  isLoading = false,
}: PurchaseFormProps) {
  const [formData, setFormData] = React.useState({
    orderId: orderId || '',
    auctionVenueId: '',
    auctionDate: '',
    auctionNumber: '',
    vehicleName: '',
    maker: '',
    model: '',
    year: '',
    mileage: '',
    bidPrice: '',
    auctionFee: '',
    transportFee: '',
    otherFee: '',
    tax: '',
    statementReceivedDate: new Date().toISOString().split('T')[0],
    paymentDueDate: '',
  });

  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);
  const [calculatedTotal, setCalculatedTotal] = React.useState(0);

  const auctionVenueOptions = [
    { value: 'venue-001', label: 'ベイオーク東京' },
    { value: 'venue-002', label: 'ベイオーク大阪' },
    { value: 'venue-003', label: 'ベイオーク名古屋' },
  ];

  const orderOptions = mockOrders
    .filter((o) => o.orderType === 'buy')
    .map((order) => ({
      value: order.id,
      label: `${order.orderNumber} - ${mockClients.find((c) => c.id === order.clientId)?.name}`,
    }));

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const orderId = e.target.value;
    setFormData((prev) => ({ ...prev, orderId }));

    const order = mockOrders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
    }
  };

  React.useEffect(() => {
    const bidPrice = parseFloat(formData.bidPrice) || 0;
    const auctionFee = parseFloat(formData.auctionFee) || 0;
    const transportFee = parseFloat(formData.transportFee) || 0;
    const otherFee = parseFloat(formData.otherFee) || 0;
    const tax = parseFloat(formData.tax) || 0;

    const total = bidPrice + auctionFee + transportFee + otherFee + tax;
    setCalculatedTotal(total);
  }, [
    formData.bidPrice,
    formData.auctionFee,
    formData.transportFee,
    formData.otherFee,
    formData.tax,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.orderId || !formData.bidPrice || !formData.vehicleName) {
      alert('受注、落札価格、車種名は必須です');
      return;
    }

    onSubmit({
      ...formData,
      totalPurchaseAmount: calculatedTotal,
    });
  };

  const getOrderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      buy: '買い注文',
      sell: '売り注文',
      mediation: '仲介売買',
    };
    return labels[type] || type;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
                      mockClients.find((c) => c.id === selectedOrder.clientId)
                        ?.name
                    }
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    注文種別
                  </label>
                  <div className="px-3 py-2 bg-gray-100 rounded text-sm text-gray-700">
                    {getOrderTypeLabel(selectedOrder.orderType)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    受注日
                  </label>
                  <div className="px-3 py-2 bg-gray-100 rounded text-sm text-gray-700">
                    {new Date(selectedOrder.orderDate).toLocaleDateString(
                      'ja-JP'
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
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
                オークション会場 <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.auctionVenueId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    auctionVenueId: e.target.value,
                  }))
                }
                required
                placeholder="選択してください"
                options={auctionVenueOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                オークション日 <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.auctionDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    auctionDate: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                オークション番号
              </label>
              <Input
                type="text"
                placeholder="例：20240228-001"
                value={formData.auctionNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    auctionNumber: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                計算書受領日
              </label>
              <Input
                type="date"
                value={formData.statementReceivedDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    statementReceivedDate: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                支払期限
              </label>
              <Input
                type="date"
                value={formData.paymentDueDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentDueDate: e.target.value,
                  }))
                }
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
                placeholder="例：セルシオ"
                value={formData.vehicleName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    vehicleName: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メーカー
              </label>
              <Input
                type="text"
                placeholder="例：トヨタ"
                value={formData.maker}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maker: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                型式
              </label>
              <Input
                type="text"
                placeholder="例：GRX120"
                value={formData.model}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    model: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                年式
              </label>
              <Input
                type="number"
                placeholder="例：2023"
                value={formData.year}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    year: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                走行距離（km）
              </label>
              <Input
                type="number"
                placeholder="例：25000"
                value={formData.mileage}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    mileage: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 金額情報 */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">金額情報</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                落札価格 <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="例：1500000"
                value={formData.bidPrice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bidPrice: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                オークション手数料
              </label>
              <Input
                type="number"
                placeholder="例：15000"
                value={formData.auctionFee}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    auctionFee: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                陸送費
              </label>
              <Input
                type="number"
                placeholder="例：30000"
                value={formData.transportFee}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    transportFee: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                その他費用
              </label>
              <Input
                type="number"
                placeholder="例：5000"
                value={formData.otherFee}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    otherFee: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                消費税
              </label>
              <Input
                type="number"
                placeholder="例：155000"
                value={formData.tax}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tax: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                仕入れ合計
              </label>
              <div className="px-3 py-2 bg-blue-50 rounded text-lg font-bold text-blue-600">
                ¥{calculatedTotal.toLocaleString('ja-JP')}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 送信ボタン */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" disabled={isLoading}>
          キャンセル
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? '登録中...' : '仕入れを登録'}
        </Button>
      </div>
    </form>
  );
}