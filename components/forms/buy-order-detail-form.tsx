
// ========================================
// 2. BuyOrderDetailForm - 更新版
// ========================================
'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface BuyOrderDetailFormProps {
  orderId?: string;
  onSubmit: (formData: any) => void;
  isLoading?: boolean;
}

export function BuyOrderDetailForm({
  orderId,
  onSubmit,
  isLoading = false,
}: BuyOrderDetailFormProps) {
  const [formData, setFormData] = React.useState({
    clientId: '',
    vehiclePrice: '',
    desiredDeliveryDate: '',
    desiredMaker: '',
    desiredModel: '',
    desiredYear: '',
    desiredMileage: '',
    desiredColor: '',
    desiredGrade: '',
    desiredDriveType: '2wd',
    desiredFuel: 'G',
    desiredEquipment: [] as string[],
    acceptRepairHistory: false,
    acceptMeterTamper: false,
    acceptRental: false,
    budgetMax: '',
    specialRequests: '',
    notes: '',
  });

  const clientOptions = [
    { value: 'client-001', label: '田中自動車' },
    { value: 'client-002', label: '山田モータース' },
    { value: 'client-003', label: '鈴木カーディーラー' },
  ];

  const colorOptions = [
    { value: '白', label: '白' },
    { value: 'パール', label: 'パール' },
    { value: '黒', label: '黒' },
    { value: '赤', label: '赤' },
    { value: '青', label: '青' },
    { value: '紺', label: '紺' },
    { value: '黄', label: '黄' },
    { value: '緑', label: '緑' },
    { value: '茶', label: '茶' },
    { value: '金', label: '金' },
    { value: '銀', label: '銀' },
    { value: '灰', label: '灰' },
    { value: 'ガンメタ', label: 'ガンメタ' },
    { value: '橙', label: '橙' },
    { value: '紫', label: '紫' },
    { value: '桃', label: '桃' },
    { value: '肌', label: '肌' },
  ];

  const driveTypeOptions = [
    { value: 'all', label: '指定なし' },
    { value: '2wd', label: '2WD' },
    { value: '4wd', label: '4WD' },
  ];

  const fuelOptions = [
    { value: 'all', label: '指定なし' },
    { value: 'G', label: 'ガソリン' },
    { value: 'D', label: 'ディーゼル' },
    { value: 'E', label: '電気' },
    { value: 'HV', label: 'ハイブリッド' },
  ];

  const equipmentOptions = [
    { value: 'PS', label: 'パワーステアリング' },
    { value: 'PW', label: 'パワーウィンドウ' },
    { value: 'CD', label: 'CD' },
    { value: 'MD', label: 'MD' },
    { value: 'TV', label: 'テレビ' },
    { value: 'NAVI', label: 'ナビゲーション' },
    { value: 'ABS', label: 'ABS' },
    { value: 'AIRBAG', label: 'エアバッグ' },
    { value: 'AC', label: 'エアコン' },
    { value: 'KEYLESS', label: 'キーレス' },
  ];

  const handleEquipmentToggle = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      desiredEquipment: prev.desiredEquipment.includes(value)
        ? prev.desiredEquipment.filter((e) => e !== value)
        : [...prev.desiredEquipment, value],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId || !formData.vehiclePrice) {
      alert('顧客と車両価格は必須です');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">基本情報</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                顧客 <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.clientId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, clientId: e.target.value }))
                }
                required
                placeholder="選択してください"
                options={clientOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                希望納期
              </label>
              <Input
                type="date"
                value={formData.desiredDeliveryDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    desiredDeliveryDate: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                予算上限（万円）
              </label>
              <Input
                type="number"
                placeholder="例：150"
                value={formData.budgetMax}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, budgetMax: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                車両価格（目安）<span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="例：1500000"
                value={formData.vehiclePrice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    vehiclePrice: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 車両希望条件 */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">車両希望条件</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メーカー
              </label>
              <Input
                type="text"
                placeholder="例：トヨタ"
                value={formData.desiredMaker}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    desiredMaker: e.target.value,
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
                value={formData.desiredModel}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    desiredModel: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                年式
              </label>
              <Input
                type="text"
                placeholder="例：2020年～2023年"
                value={formData.desiredYear}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    desiredYear: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                グレード
              </label>
              <Input
                type="text"
                placeholder="例：Sエディション"
                value={formData.desiredGrade}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    desiredGrade: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                走行距離
              </label>
              <Input
                type="text"
                placeholder="例：50000km以下"
                value={formData.desiredMileage}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    desiredMileage: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                色
              </label>
              <Select
                value={formData.desiredColor}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    desiredColor: e.target.value,
                  }))
                }
                placeholder="選択してください"
                options={colorOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                駆動方式
              </label>
              <Select
                value={formData.desiredDriveType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    desiredDriveType: e.target.value,
                  }))
                }
                options={driveTypeOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                燃料
              </label>
              <Select
                value={formData.desiredFuel}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    desiredFuel: e.target.value,
                  }))
                }
                options={fuelOptions}
              />
            </div>
          </div>

          {/* 希望装備 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              希望装備
            </label>
            <div className="flex flex-wrap gap-2">
              {equipmentOptions.map((eq) => (
                <button
                  key={eq.value}
                  type="button"
                  onClick={() => handleEquipmentToggle(eq.value as string)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    formData.desiredEquipment.includes(eq.value as string)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {eq.label}
                </button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 受け入れ条件 */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">受け入れ条件</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.acceptRepairHistory}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    acceptRepairHistory: e.target.checked,
                  }))
                }
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">修復歴有の車両を受け入れる</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.acceptMeterTamper}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    acceptMeterTamper: e.target.checked,
                  }))
                }
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">
                メーター改ざん車を受け入れる
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.acceptRental}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    acceptRental: e.target.checked,
                  }))
                }
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">レンタカーを受け入れる</span>
            </label>
          </div>
        </CardBody>
      </Card>

      {/* 特別要望・備考 */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">特別要望・備考</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              特別なご要望
            </label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  specialRequests: e.target.value,
                }))
              }
              placeholder="例：急ぎで納品希望、内装は綺麗な状態希望"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              placeholder="その他の備考があればご記入ください"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardBody>
      </Card>

      {/* 送信ボタン */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="secondary"
          disabled={isLoading}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? '登録中...' : '買い注文を登録'}
        </Button>
      </div>
    </form>
  );
}


