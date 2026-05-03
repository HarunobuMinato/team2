// ============================================
// 3. components/forms/buy-order-form.tsx【修正版】
// ============================================

'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BuyOrderFormInput } from '@/types/order';
import { DesiredVehicleFormInput } from '@/types/desired-vehicle';

interface Client {
  id: number;
  name: string;
  client_code: string;
  contact_person?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface BuyOrderFormProps {
  onSubmit: (formData: BuyOrderFormInput) => void;
  isLoading?: boolean;
}

export const BuyOrderForm: React.FC<BuyOrderFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = React.useState<BuyOrderFormInput>({
    clientId: '',
    salesPersonId: '',
    orderDate: new Date().toISOString().split('T')[0],
    desiredDeliveryDate: '',
    notes: '',
    desiredVehicles: [
      {
        vehicleName: '',
        maker: '',
        model: '',
        desiredYearFrom: undefined,
        desiredYearTo: undefined,
        desiredMileageMax: undefined,
        inspectionDateMin: '',
        color: '',
        notes: '',
      },
    ],
  });

  // 【新規】顧客と営業担当者を API から取得
  const [customers, setCustomers] = useState<Client[]>([]);
  const [salesPeople, setSalesPeople] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 顧客と営業担当者を並列取得
        const [customersRes, salesRes] = await Promise.all([
          fetch('/api/clients?type=customer'),
          fetch('/api/users?role=sales'),
        ]);

        const customersData = await customersRes.json();
        const salesData = await salesRes.json();

        if (customersData.success) {
          setCustomers(customersData.data);
        } else {
          setError('顧客情報の取得に失敗しました');
        }

        if (salesData.success) {
          setSalesPeople(salesData.data);
        } else {
          setError('営業担当者情報の取得に失敗しました');
        }
      } catch (err) {
        setError('データの取得に失敗しました');
        console.error('データ取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 希望車両を追加
  const addDesiredVehicle = () => {
    setFormData((prev) => ({
      ...prev,
      desiredVehicles: [
        ...prev.desiredVehicles,
        {
          vehicleName: '',
          maker: '',
          model: '',
          desiredYearFrom: undefined,
          desiredYearTo: undefined,
          desiredMileageMax: undefined,
          inspectionDateMin: '',
          color: '',
          notes: '',
        },
      ],
    }));
  };

  // 希望車両を削除
  const removeDesiredVehicle = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      desiredVehicles: prev.desiredVehicles.filter((_, i) => i !== index),
    }));
  };

  // 希望車両の入力を更新
  const updateDesiredVehicle = (
    index: number,
    field: keyof DesiredVehicleFormInput,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      desiredVehicles: prev.desiredVehicles.map((vehicle, i) =>
        i === index ? { ...vehicle, [field]: value } : vehicle
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('フォームデータ送信前:', formData);


    if (formData.desiredVehicles.length === 0) {
      alert('最低1台の希望車両を登録してください');
      return;
    }

    const hasInvalidVehicles = formData.desiredVehicles.some(
      (v) => !v.vehicleName
    );
    if (hasInvalidVehicles) {
      alert('すべての車種名を入力してください');
      return;
    }

    onSubmit(formData);
  };

  // 【修正】顧客オプション（API データから生成）
  const customerOptions = customers.map((c) => ({
    value: c.id.toString(),
    label: `${c.name}${c.contact_person ? ` (${c.contact_person})` : ''}`,
  }));

  // 【修正】営業担当者オプション（API データから生成）
  const salesPersonOptions = salesPeople.map((u) => ({
    value: u.id.toString(),
    label: u.name,
  }));

  // ローディング中の表示
  if (loading) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <p className="text-gray-500">データを読み込み中...</p>
        </CardBody>
      </Card>
    );
  }

  // エラー表示
  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardBody>
          <p className="text-red-700">エラー: {error}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 受注基本情報 */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">受注基本情報</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="顧客"
              options={[
                { value: '', label: '選択してください' },
                ...customerOptions
              ]}
              value={formData.clientId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  clientId: e.target.value,
                }))
              }
              required
            />

            <Select
              label="営業担当者"
              options={[
                { value: '', label: '選択してください' },
                ...salesPersonOptions
              ]}
              value={formData.salesPersonId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  salesPersonId: e.target.value,
                }))
              }
              required
            />

            <Input
              label="受注日"
              type="date"
              value={formData.orderDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  orderDate: e.target.value,
                }))
              }
              required
            />

            <Input
              label="希望納期"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              備考
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="特別な指示や備考があれば記入してください"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
            />
          </div>
        </CardBody>
      </Card>

      {/* 希望車両情報 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">希望車両情報</h2>
          <Badge variant="bg-blue-100 text-blue-800">
            {formData.desiredVehicles.length}台
          </Badge>
        </div>

        {formData.desiredVehicles.map((vehicle, index) => (
          <Card key={index} className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">
                  {vehicle.vehicleName || `希望車両 ${index + 1}`}
                </h3>
                {formData.desiredVehicles.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDesiredVehicle(index)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    削除
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="車種名（必須）"
                  placeholder="例：トヨタ プリウス"
                  value={vehicle.vehicleName}
                  onChange={(e) =>
                    updateDesiredVehicle(index, 'vehicleName', e.target.value)
                  }
                  required
                />

                <Input
                  label="メーカー"
                  placeholder="例：トヨタ"
                  value={vehicle.maker || ''}
                  onChange={(e) =>
                    updateDesiredVehicle(index, 'maker', e.target.value)
                  }
                />

                <Input
                  label="型式"
                  placeholder="例：プリウス"
                  value={vehicle.model || ''}
                  onChange={(e) =>
                    updateDesiredVehicle(index, 'model', e.target.value)
                  }
                />

                <Input
                  label="色"
                  placeholder="例：シルバー"
                  value={vehicle.color || ''}
                  onChange={(e) =>
                    updateDesiredVehicle(index, 'color', e.target.value)
                  }
                />

                <Input
                  label="希望年式（開始）"
                  type="number"
                  placeholder="例：2020"
                  value={vehicle.desiredYearFrom || ''}
                  onChange={(e) =>
                    updateDesiredVehicle(
                      index,
                      'desiredYearFrom',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                />

                <Input
                  label="希望年式（終了）"
                  type="number"
                  placeholder="例：2023"
                  value={vehicle.desiredYearTo || ''}
                  onChange={(e) =>
                    updateDesiredVehicle(
                      index,
                      'desiredYearTo',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                />

                <Input
                  label="走行距離上限（km）"
                  type="number"
                  placeholder="例：50000"
                  value={vehicle.desiredMileageMax || ''}
                  onChange={(e) =>
                    updateDesiredVehicle(
                      index,
                      'desiredMileageMax',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                />

                <Input
                  label="希望車検期限（最小）"
                  type="date"
                  value={vehicle.inspectionDateMin || ''}
                  onChange={(e) =>
                    updateDesiredVehicle(
                      index,
                      'inspectionDateMin',
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  この車両に関する備考
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="希望仕様や特別な要望があれば記入してください"
                  value={vehicle.notes || ''}
                  onChange={(e) =>
                    updateDesiredVehicle(index, 'notes', e.target.value)
                  }
                />
              </div>
            </CardBody>
          </Card>
        ))}

        <Button
          type="button"
          variant="secondary"
          onClick={addDesiredVehicle}
          fullWidth
        >
          + 希望車両を追加
        </Button>
      </div>

      {/* フッター */}
      <Card>
        <CardFooter className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" disabled={isLoading}>
            キャンセル
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            受注を登録
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

BuyOrderForm.displayName = 'BuyOrderForm';