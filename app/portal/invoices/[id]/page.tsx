'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { Badge } from '@/components/ui/badge';
import { mockInvoices } from '@/data/invoices';
import { mockDeliveries } from '@/data/deliveries';
import { mockOrders } from '@/data/orders';
import { mockPurchaseRecords } from '@/data/purchase-records';
import {
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_COLORS,
} from '@/constants/status';
import { formatCurrency, formatDateJP } from '@/lib/utils';

export default function PortalInvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const invoice = mockInvoices.find((i) => i.id === invoiceId);

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">請求書が見つかりません</p>
        <Link href="/portal/invoices">
          <Button>請求書一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  // 請求書に紐づいた納品書を取得
  const relatedDeliveries = (invoice.deliveryIds || [])
    .map((id) => mockDeliveries.find((d) => d.id === id))
    .filter(Boolean);

  // 納品書ごとの詳細情報を取得
  const deliveryDetails = relatedDeliveries.map((delivery) => {
    if (!delivery) return null;

    const order = mockOrders.find((o) => o.id === delivery.orderId);
    
    // 納品書に紐づいた仕入実績を取得
    const purchaseRecords = (delivery.purchaseRecordIds || [])
      .map((id) => mockPurchaseRecords.find((p) => p.id === id))
      .filter(Boolean);

    return {
      delivery,
      order,
      purchaseRecords,
      vehicleCount: purchaseRecords.length,
      totalVehicleAmount: purchaseRecords.reduce(
        (sum, p) => sum + (p?.bidPrice || 0),
        0
      ),
    };
  });

  const remainingAmount = invoice.totalAmount - invoice.paidAmount;
  const isPaid = invoice.paidAmount === invoice.totalAmount;

  return (
    <div>
      <PageHeader
        title="請求書詳細"
        subtitle={invoice.invoiceNumber}
        actions={
          <div className="flex gap-2">
            {remainingAmount > 0 && (
              <Link href={`/portal/invoices/${invoice.id}/payment`}>
                <Button variant="primary">💳 支払う</Button>
              </Link>
            )}
            <Link href="/portal/invoices">
              <Button variant="secondary">戻る</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2">
          {/* 請求書基本情報 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  請求書情報
                </h2>
                <Badge variant={INVOICE_STATUS_COLORS[invoice.status]}>
                  {INVOICE_STATUS_LABELS[invoice.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">請求書番号</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {invoice.invoiceNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">請求日</p>
                  <p className="text-base text-gray-900">
                    {formatDateJP(invoice.invoiceDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">期日</p>
                  <p className="text-base text-gray-900">
                    {formatDateJP(invoice.dueDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">納品書件数</p>
                  <p className="text-base font-semibold text-gray-900">
                    {relatedDeliveries.length}件
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 対象納品書と詳細 */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                請求対象の納品書
              </h2>
            </CardHeader>
            <CardBody>
              {deliveryDetails.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  納品書情報がありません
                </p>
              ) : (
                <div className="space-y-6">
                  {deliveryDetails.map((detail, index) => {
                    if (!detail) return null;
                    const { delivery, order, purchaseRecords, vehicleCount, totalVehicleAmount } = detail;

                    return (
                      <div
                        key={delivery?.id}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        {/* 納品書ヘッダー */}
                        <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                          <div>
                            <p className="text-lg font-semibold text-gray-900">
                              {delivery?.deliveryNumber}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order?.orderNumber && `受注: ${order.orderNumber}`}
                              {delivery?.deliveryDate && ` | 納品日: ${formatDateJP(delivery.deliveryDate)}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={DELIVERY_STATUS_COLORS[delivery?.status || 'draft']}>
                              {DELIVERY_STATUS_LABELS[delivery?.status || 'draft']}
                            </Badge>
                          </div>
                        </div>

                        {/* 車両情報 */}
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">
                            車両情報（{vehicleCount}台）
                          </h3>

                          {purchaseRecords.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-2">
                              車両情報がありません
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {purchaseRecords.map((record, idx) => (
                                <div
                                  key={record?.id || idx}
                                  className="p-3 bg-white rounded border border-gray-200 hover:bg-blue-50 transition-colors"
                                >
                                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                                    <div>
                                      <p className="text-xs text-gray-600 mb-0.5">
                                        車種
                                      </p>
                                      <p className="font-medium text-gray-900">
                                        {record?.vehicleName || '-'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-600 mb-0.5">
                                        年式
                                      </p>
                                      <p className="font-medium text-gray-900">
                                        {record?.year || '-'}年
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-600 mb-0.5">
                                        走行距離
                                      </p>
                                      <p className="font-medium text-gray-900">
                                        {record?.mileage?.toLocaleString() || '-'}km
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-600 mb-0.5">
                                        落札価格
                                      </p>
                                      <p className="font-semibold text-blue-600">
                                        {formatCurrency(record?.bidPrice || 0)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-600 mb-0.5">
                                        ステータス
                                      </p>
                                      <Badge variant="bg-blue-100 text-blue-800" className="text-xs">
                                        {record?.status || '-'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* 納品書の金額詳細 */}
                        <div className="bg-white rounded-lg p-3 space-y-2 text-sm border border-gray-200">
                          <div className="font-semibold text-gray-900 pb-2 border-b border-gray-200">
                            金額内訳
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">車両価格合計</span>
                            <span className="font-medium">
                              {formatCurrency(totalVehicleAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">手数料</span>
                            <span className="font-medium">
                              {formatCurrency(delivery?.commission || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">消費税（10%）</span>
                            <span className="font-medium">
                              {formatCurrency(delivery?.tax || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold text-gray-900">
                            <span>納品書合計</span>
                            <span className="text-lg text-blue-600">
                              {formatCurrency(delivery?.totalAmount || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>

          {/* 振込先情報 */}
          {invoice.bankAccount && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  振込先情報
                </h2>
              </CardHeader>
              <CardBody>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">銀行</span>
                    <span className="font-medium">
                      {invoice.bankAccount.bankName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">支店</span>
                    <span className="font-medium">
                      {invoice.bankAccount.branchName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">口座種別</span>
                    <span className="font-medium">
                      {invoice.bankAccount.accountType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">口座番号</span>
                    <span className="font-medium">
                      {invoice.bankAccount.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">名義</span>
                    <span className="font-medium">
                      {invoice.bankAccount.accountHolder}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* 右サイドバー - 金額情報 */}
        <div>
          <Card className="sticky top-8 mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">金額詳細</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {/* 請求内容の集計 */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                    請求内容
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">車両合計金額</span>
                      <span className="font-medium">
                        {formatCurrency(deliveryDetails.reduce(
                          (sum, d) => sum + (d?.totalVehicleAmount || 0),
                          0
                        ))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">手数料合計</span>
                      <span className="font-medium">
                        {formatCurrency(relatedDeliveries.reduce(
                          (sum, d) => sum + (d?.commission || 0),
                          0
                        ))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">請求金額（税抜き）</span>
                    <span className="font-medium">
                      {formatCurrency(invoice.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600">消費税（10%）</span>
                    <span className="font-medium">
                      {formatCurrency(invoice.tax)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold text-gray-900">
                      請求合計
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(invoice.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* 支払状況 */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-medium text-gray-900 pb-2 border-b border-gray-200">
                    支払状況
                  </p>
                  <div className="flex justify-between">
                    <span className="text-gray-600">支払済み</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(invoice.paidAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">未払い</span>
                    <span
                      className={`font-medium ${remainingAmount > 0
                        ? 'text-orange-600'
                        : 'text-green-600'
                      }`}
                    >
                      {formatCurrency(remainingAmount)}
                    </span>
                  </div>
                </div>

                {/* 進捗バー */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">支払率</span>
                    <span className="font-medium">
                      {Math.round(
                        (invoice.paidAmount / invoice.totalAmount) * 100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${isPaid ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                      style={{
                        width: `${(invoice.paidAmount / invoice.totalAmount) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* ステータスメッセージ */}
                {isPaid && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    ✓ お支払いが完了しました
                  </div>
                )}

                {remainingAmount > 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
                    📌 未払い金額: {formatCurrency(remainingAmount)}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* 納品書サマリー */}
          {relatedDeliveries.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-gray-900">
                  納品書サマリー
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {relatedDeliveries.map((delivery) => (
                    <div
                      key={delivery?.id}
                      className="p-2 bg-gray-50 rounded border border-gray-200"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {delivery?.deliveryNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateJP(delivery?.deliveryDate || new Date())}
                      </p>
                      <p className="text-sm font-bold text-blue-600 mt-1">
                        {formatCurrency(delivery?.totalAmount || 0)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}