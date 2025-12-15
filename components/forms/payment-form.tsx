'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/card';

interface PaymentFormProps {
  invoiceNumber?: string;
  invoiceAmount?: number;
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  invoiceNumber,
  invoiceAmount,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = React.useState({
    paymentDate: '',
    amount: invoiceAmount?.toString() || '',
    paymentMethod: 'bank_transfer',
    bankName: '',
    referenceNumber: '',
    notes: '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.paymentDate) {
      newErrors.paymentDate = '入金日を入力してください';
    }

    if (!formData.amount) {
      newErrors.amount = '入金金額を入力してください';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = '有効な金額を入力してください';
    }

    if (formData.paymentMethod === 'bank_transfer' && !formData.bankName) {
      newErrors.bankName = '振込銀行名を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const paymentData = {
      ...formData,
      amount: Number(formData.amount),
    };

    onSubmit?.(paymentData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 基本情報 */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">入金情報</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {invoiceNumber && (
            <div>
              <p className="text-sm text-gray-600 mb-1">請求書番号</p>
              <p className="text-base font-semibold text-gray-900">
                {invoiceNumber}
              </p>
            </div>
          )}

          <Input
            label="入金日"
            type="date"
            value={formData.paymentDate}
            onChange={(e) => handleChange('paymentDate', e.target.value)}
            error={errors.paymentDate}
            required
          />

          <Input
            label="入金金額"
            type="number"
            placeholder="0"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            error={errors.amount}
            required
          />

          {invoiceAmount && (
            <p className="text-sm text-gray-600">
              請求額: ¥{invoiceAmount.toLocaleString('ja-JP')}
            </p>
          )}
        </CardBody>
      </Card>

      {/* 支払方法 */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">支払方法</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Select
            label="支払方法"
            options={[
              { value: 'bank_transfer', label: '銀行振込' },
              { value: 'cash', label: 'キャッシュ' },
              { value: 'check', label: '小切手' },
            ]}
            value={formData.paymentMethod}
            onChange={(e) => handleChange('paymentMethod', e.target.value)}
          />

          {formData.paymentMethod === 'bank_transfer' && (
            <>
              <Input
                label="振込銀行名"
                type="text"
                placeholder="〇〇銀行"
                value={formData.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                error={errors.bankName}
              />

              <Input
                label="参照番号（振込番号等）"
                type="text"
                placeholder="REF-2024-0001"
                value={formData.referenceNumber}
                onChange={(e) => handleChange('referenceNumber', e.target.value)}
              />
            </>
          )}

          <Input
            label="備考"
            type="text"
            placeholder="特記事項があれば記入"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
          />
        </CardBody>
      </Card>

      {/* フッター */}
      <CardFooter className="flex gap-3 justify-end">
        <Button variant="secondary" type="button">
          キャンセル
        </Button>
        <Button variant="primary" type="submit" isLoading={isLoading}>
          入金を登録
        </Button>
      </CardFooter>
    </form>
  );
};

PaymentForm.displayName = 'PaymentForm';