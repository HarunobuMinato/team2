'use client';

import React from 'react';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockClients } from '@/data/clients';
import { mockDeliveries } from '@/data/deliveries';
import { mockOrders } from '@/data/orders';
import { formatCurrency, formatDateJP } from '@/lib/utils';

interface InvoiceFormProps {
  onSubmit: (formData: any) => void;
  isLoading?: boolean;
}

interface SelectableDelivery {
  deliveryId: string;
  deliveryNumber: string;
  clientId: string;
  clientName: string;
  orderNumber?: string;
  totalAmount: number;
  checked: boolean;
}

export function InvoiceForm({ onSubmit, isLoading = false }: InvoiceFormProps) {
  const [formData, setFormData] = React.useState({
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    notes: '',
  });

  const [searchTerm, setSearchTerm] = React.useState('');
  const [allDeliveries, setAllDeliveries] = React.useState<SelectableDelivery[]>(
    []
  );
  const [selectedDeliveries, setSelectedDeliveries] = React.useState<
    SelectableDelivery[]
  >([]);
  const [totalAmount, setTotalAmount] = React.useState(0);

  // 初期化：全納品書を取得
  React.useEffect(() => {
    const deliveries = mockDeliveries
      .filter(
        (d) =>
          d.status === 'issued' ||
          d.status === 'received' ||
          d.status === 'inspected'
      )
      .map((d) => {
        const order = mockOrders.find((o) => o.id === d.orderId);
        const client = mockClients.find((c) => c.id === d.clientId);
        return {
          deliveryId: d.id,
          deliveryNumber: d.deliveryNumber,
          clientId: d.clientId,
          clientName: client?.name || '不明',
          orderNumber: order?.orderNumber,
          totalAmount: d.totalAmount,
          checked: false,
        };
      });

    setAllDeliveries(deliveries);
  }, []);

  // フィルタリング
  const filteredDeliveries = allDeliveries.filter((d) => {
    const matchesSearch =
      d.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // 納品書の選択/解除
  const handleDeliveryToggle = (deliveryId: string) => {
    const updated = allDeliveries.map((d) =>
      d.deliveryId === deliveryId ? { ...d, checked: !d.checked } : d
    );
    setAllDeliveries(updated);

    const selected = updated.filter((d) => d.checked);
    setSelectedDeliveries(selected);
  };

  // 全選択/解除
  const handleSelectAll = () => {
    const allChecked = filteredDeliveries.every((d) => d.checked);
    const updated = allDeliveries.map((d) => {
      const isInFiltered = filteredDeliveries.some(
        (f) => f.deliveryId === d.deliveryId
      );
      return isInFiltered ? { ...d, checked: !allChecked } : d;
    });
    setAllDeliveries(updated);

    const selected = updated.filter((d) => d.checked);
    setSelectedDeliveries(selected);
  };

  // 合計金額の計算
  React.useEffect(() => {
    const total = selectedDeliveries.reduce((sum, d) => sum + d.totalAmount, 0);
    setTotalAmount(total);
  }, [selectedDeliveries]);

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

    if (selectedDeliveries.length === 0) {
      alert('1件以上の納品書を選択してください');
      return;
    }

    if (!formData.invoiceDate) {
      alert('請求日は必須です');
      return;
    }

    if (!formData.dueDate) {
      alert('期日は必須です');
      return;
    }

    onSubmit({
      ...formData,
      selectedDeliveryIds: selectedDeliveries.map((d) => d.deliveryId),
      deliveryCount: selectedDeliveries.length,
      totalAmount,
      multiClient: selectedDeliveries.some(
        (d) => d.clientId !== selectedDeliveries[0].clientId
      ),
    });
  };

  // 顧客ごとの集計
  const clientSummary = React.useMemo(() => {
    const summary: Record<
      string,
      { clientName: string; count: number; amount: number }
    > = {};

    selectedDeliveries.forEach((d) => {
      if (!summary[d.clientId]) {
        summary[d.clientId] = { clientName: d.clientName, count: 0, amount: 0 };
      }
      summary[d.clientId].count++;
      summary[d.clientId].amount += d.totalAmount;
    });

    return Object.values(summary);
  }, [selectedDeliveries]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 説明 */}
      <Card className="bg-blue-50 border border-blue-200">
        <CardBody>
          <p className="text-sm text-blue-700 font-medium">
            💡 複数の異なる顧客の納品書から一括請求を作成
          </p>
          <p className="text-xs text-blue-600 mt-2">
            顧客を指定せず、複数の納品書を選択して1つの請求書を生成します。
            複数顧客の場合は、集計請求書として処理されます。
          </p>
        </CardBody>
      </Card>

      {/* 納品書検索・選択 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              納品書選択（複数顧客対応）
            </h2>
            <Badge variant="bg-blue-100 text-blue-800">
              {selectedDeliveries.length}件選択（合計{' '}
              {formatCurrency(totalAmount)}）
            </Badge>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* 検索 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              検索・フィルタ
            </label>
            <input
              type="text"
              placeholder="納品書番号、顧客名、受注番号で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 全選択ボタン */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSelectAll}
            >
              {filteredDeliveries.every((d) => d.checked)
                ? '✓ すべて解除'
                : '☐ 検索結果をすべて選択'}
            </Button>
            <p className="text-xs text-gray-500 flex items-center">
              {filteredDeliveries.length}件中 {selectedDeliveries.length}件選択
            </p>
          </div>

          {/* 納品書リスト */}
          <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
            {filteredDeliveries.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                該当する納品書がありません
              </p>
            ) : (
              filteredDeliveries.map((delivery) => (
                <div
                  key={delivery.deliveryId}
                  className="flex items-center p-2 rounded hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <input
                    type="checkbox"
                    id={delivery.deliveryId}
                    checked={delivery.checked}
                    onChange={() => handleDeliveryToggle(delivery.deliveryId)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <label
                    htmlFor={delivery.deliveryId}
                    className="ml-3 flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {delivery.deliveryNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {delivery.clientName} | 受注:{' '}
                          {delivery.orderNumber || '-'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(delivery.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              ))
            )}
          </div>

          <p className="text-xs text-gray-600">
            💡 ステータス「発行済み」「受領済み」「検収済み」の納品書が対象
          </p>
        </CardBody>
      </Card>

      {/* 選択内容の確認 */}
      {selectedDeliveries.length > 0 && (
        <Card className="bg-amber-50 border border-amber-200">
          <CardHeader>
            <h3 className="text-base font-semibold text-gray-900">
              選択納品書の集計
            </h3>
          </CardHeader>
          <CardBody>
            {clientSummary.length > 1 ? (
              <div>
                <p className="text-sm text-amber-700 font-medium mb-3">
                  ⚠️ 複数顧客が含まれています
                </p>
                <div className="space-y-2">
                  {clientSummary.map((summary, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2 bg-white rounded border border-amber-100"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {summary.clientName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {summary.count}件
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(summary.amount)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">合計</span>
                    <span className="text-lg font-bold text-amber-700">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">
                    {clientSummary[0]?.clientName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedDeliveries.length}件
                  </p>
                </div>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* 請求情報 */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">請求情報</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                請求日 <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                期日 <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 デフォルトは請求日から30日後
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                備考
              </label>
              <textarea
                name="notes"
                placeholder="例：複数納品分のまとめ請求、支払方法の注記など"
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
            {isLoading ? '作成中...' : '請求書を作成'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}