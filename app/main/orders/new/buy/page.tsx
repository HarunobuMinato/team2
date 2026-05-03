// ============================================
// 1. app/(main)/orders/new/buy/page.tsx【修正版】
// ============================================

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layouts/page-header';
import { Card, CardBody } from '@/components/ui/card';
import { generateOrderNumber } from '@/lib/utils';
import { BuyOrderForm } from '@/components/forms/buy-order-form';

export default function BuyOrderNewPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // 【修正】希望車両を含めて送信
      const orderData = {
        order_number: generateOrderNumber(),
        order_type: 'buy',
        client_id: parseInt(formData.clientId),
        sales_person_id: formData.salesPersonId,
        order_date: formData.orderDate,
        desired_delivery_date: formData.desiredDeliveryDate || null,
        vehicle_count: formData.desiredVehicles.length,
        notes: formData.notes || null,

        // 【新規】希望車両を含める
        desired_vehicles: formData.desiredVehicles.map(
          (vehicle: any, index: number) => ({
            sequence_number: index + 1,
            vehicle_name: vehicle.vehicleName,
            maker: vehicle.maker || null,
            model: vehicle.model || null,
            desired_year_from: vehicle.desiredYearFrom || null,
            desired_year_to: vehicle.desiredYearTo || null,
            desired_mileage_max: vehicle.desiredMileageMax || null,
            inspection_date_min: vehicle.inspectionDateMin || null,
            color: vehicle.color || null,
            notes: vehicle.notes || null,
          })
        ),
      };

      console.log('送信データ:', orderData);

      // 【修正】新しいエンドポイントを使用
      const response = await fetch('/api/orders/create-with-vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '登録に失敗しました');
      }

      setSuccessMessage(
        `受注番号 ${data.data.order_number} を登録しました。顧客の確認をお待ちください。`
      );

      // 2秒後にリダイレクト
      setTimeout(() => {
        router.push('/main/orders');
      }, 2000);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : '予期しないエラーが発生しました';
      setErrorMessage(errorMsg);
      console.error('登録エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="買い注文登録"
        subtitle="新規に買い注文を登録します"
        actions={
          <Link href="/main/orders">
            <Button variant="secondary">戻る</Button>
          </Link>
        }
      />

      {/* 成功メッセージ */}
      {successMessage && (
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardBody>
            <p className="text-green-700">✓ {successMessage}</p>
          </CardBody>
        </Card>
      )}

      {/* エラーメッセージ */}
      {errorMessage && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardBody>
            <p className="text-red-700">✗ {errorMessage}</p>
          </CardBody>
        </Card>
      )}

      <BuyOrderForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}