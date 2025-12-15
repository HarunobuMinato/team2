'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { mockPurchases } from '@/data/purchases';
import { mockOrders } from '@/data/orders';
import { mockClients } from '@/data/clients';
import { formatCurrency, formatDateJP } from '@/lib/utils';

interface SelectOption {
  value: string | number;
  label: string;
}

interface DeliveryFormProps {
  purchaseId?: string;
  onSubmit: (formData: any) => void;
  isLoading?: boolean;
}

export function DeliveryForm({
  purchaseId,
  onSubmit,
  isLoading = false,
}: DeliveryFormProps) {
  const [formData, setFormData] = React.useState({
    purchaseId: purchaseId || '',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryLocation: '',
    notes: '',
  });

  const [selectedPurchase, setSelectedPurchase] = React.useState<any>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // 仕入れオプションの生成
  const purchaseOptions: SelectOption[] = mockPurchases.map((purchase) => {
    const order = mockOrders.find((o) => o.id === purchase.orderId);
    const client = order
      ? mockClients.find((c) => c.id === order.clientId)
      : null;
    return {
      value: purchase.id,
      label: `${purchase.purchaseNumber} - ${purchase.vehicleName} (${client?.name || 'N/A'})`,
    };
  });

  // 仕入れ選択時の処理
  const handlePurchaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setFormData((prev) => ({ ...prev, purchaseId: selectedId }));

    const purchase = mockPurchases.find((p) => p.id === selectedId);
    if (purchase) {
      setSelectedPurchase(purchase);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.purchaseId;
        return newErrors;
      });
    }
  };

  // バリデーション
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.purchaseId) {
      newErrors.purchaseId = '仕入れを選択してください';
    }

    if (!formData.deliveryDate) {
      newErrors.deliveryDate = '納品日を選択してください';
    }

    if (!formData.deliveryLocation) {
      newErrors.deliveryLocation = '納品場所は必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 仕入れ情報 */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">仕入れ情報</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                仕入れ番号 <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.purchaseId}
                onChange={handlePurchaseChange}
                className={errors.purchaseId ? 'border-red-500' : ''}
                required
                placeholder="選択してください"
                options={purchaseOptions}
              />
              {errors.purchaseId && (
                <p className="text-red-500 text-xs mt-1">{errors.purchaseId}</p>
              )}
            </div>
          </div>

          {selectedPurchase && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">車種名</p>
                  <p className="font-medium text-gray-900">
                    {selectedPurchase.vehicleName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">オークション日</p>
                  <p className="font-medium text-gray-900">
                    {formatDateJP(selectedPurchase.auctionDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">仕入れ金額</p>
                  <p className="font-medium text-blue-600">
                    {formatCurrency(selectedPurchase.totalPurchaseAmount)}
                  </p>
                </div>

                {mockOrders.find((o) => o.id === selectedPurchase.orderId) && (
                  <div>
                    <p className="text-xs text-gray-600">受注番号</p>
                    <p className="font-medium text-gray-900">
                      {
                        mockOrders.find((o) => o.id === selectedPurchase.orderId)
                          ?.orderNumber
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

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
                value={formData.deliveryDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deliveryDate: e.target.value,
                  }))
                }
                className={errors.deliveryDate ? 'border-red-500' : ''}
                required
              />
              {errors.deliveryDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.deliveryDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                納品場所 <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="例：東京都渋谷区"
                value={formData.deliveryLocation}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deliveryLocation: e.target.value,
                  }))
                }
                className={errors.deliveryLocation ? 'border-red-500' : ''}
                required
              />
              {errors.deliveryLocation && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.deliveryLocation}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              備考
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              placeholder="特記事項があればご記入ください"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardBody>
      </Card>

      {/* 送信ボタン */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" disabled={isLoading}>
          キャンセル
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? '作成中...' : '納品書を作成'}
        </Button>
      </div>
    </form>
  );
}