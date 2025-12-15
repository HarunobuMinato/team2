'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/card';
import { Stepper } from '@/components/ui/stepper';
import { Inspection } from '@/types/delivery';

interface InspectionFormProps {
  inspection?: Inspection | null;
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
}

export const InspectionForm: React.FC<InspectionFormProps> = ({
  inspection,
  onSubmit,
  isLoading = false,
}) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [formData, setFormData] = React.useState({
    receivedDate: inspection?.receivedDate
      ? new Date(inspection.receivedDate).toISOString().split('T')[0]
      : '',
    inspectionDate: inspection?.inspectionDate
      ? new Date(inspection.inspectionDate).toISOString().split('T')[0]
      : '',
    inspectionResult: inspection?.inspectionResult || 'pending',
    inspectionNotes: inspection?.inspectionNotes || '',
  });

  const steps = [
    { id: 'receipt', label: '納品受領', icon: '📦' },
    { id: 'inspection', label: '検収', icon: '✓' },
    { id: 'completed', label: '完了', icon: '✓✓' },
  ];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const inspectionData = {
      ...formData,
      currentStep: steps[currentStep].id,
    };

    onSubmit?.(inspectionData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ステッパー */}
      <Card className="mb-6">
        <CardBody className="pt-8">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
            isClickable={true}
          />
        </CardBody>
      </Card>

      {/* ステップ別コンテンツ */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            {steps[currentStep].label}
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {currentStep === 0 && (
            <>
              <p className="text-gray-700 mb-4">
                納品書の内容を確認し、受け取りました。
              </p>
              <Input
                label="受領日"
                type="date"
                value={formData.receivedDate}
                onChange={(e) => handleChange('receivedDate', e.target.value)}
                required
              />
              <p className="text-sm text-gray-600">
                ✓ この日付を記録して進行します
              </p>
            </>
          )}

          {currentStep === 1 && (
            <>
              <p className="text-gray-700 mb-4">
                車両の状態を確認し、検収結果を入力してください。
              </p>
              <Input
                label="検収日"
                type="date"
                value={formData.inspectionDate}
                onChange={(e) => handleChange('inspectionDate', e.target.value)}
                required
              />

              <Select
                label="検収結果"
                options={[
                  { value: 'ok', label: '良好 - 異常なし' },
                  { value: 'ng', label: '不良 - 問題あり' },
                  { value: 'pending', label: '保留中' },
                ]}
                value={formData.inspectionResult}
                onChange={(e) => handleChange('inspectionResult', e.target.value)}
              />

              <Input
                label="検収コメント"
                type="text"
                placeholder="検収時の確認内容や特記事項"
                value={formData.inspectionNotes}
                onChange={(e) => handleChange('inspectionNotes', e.target.value)}
              />
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-medium mb-2">✓ 検収完了</p>
                <p className="text-sm text-green-600">
                  すべての手続きが完了しました。
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">受領日</span>
                  <span className="font-medium">{formData.receivedDate || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">検収日</span>
                  <span className="font-medium">{formData.inspectionDate || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">検収結果</span>
                  <span className="font-medium">
                    {formData.inspectionResult === 'ok'
                      ? '良好'
                      : formData.inspectionResult === 'ng'
                        ? '不良'
                        : '保留中'}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* フッター */}
      <CardFooter className="flex gap-3 justify-between">
        <div className="flex gap-2">
          {currentStep > 0 && (
            <Button
              variant="secondary"
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              前へ
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {currentStep < steps.length - 1 && (
            <Button
              variant="primary"
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              次へ
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button variant="primary" type="submit" isLoading={isLoading}>
              検収を完了
            </Button>
          )}
        </div>
      </CardFooter>
    </form>
  );
};

InspectionForm.displayName = 'InspectionForm';