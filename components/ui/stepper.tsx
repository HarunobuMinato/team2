'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  label: string;
  icon?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  isClickable?: boolean;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  isClickable = false,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* ステップボタン */}
            <button
              onClick={() => isClickable && onStepClick?.(index)}
              disabled={!isClickable}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold transition-all',
                index <= currentStep
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-600',
                isClickable && index <= currentStep && 'cursor-pointer hover:bg-blue-700',
              )}
              title={step.label}
            >
              {step.icon ? step.icon : index + 1}
            </button>

            {/* コネクティングライン */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-1 mx-2 rounded transition-all',
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-300',
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ステップラベル */}
      <div className="flex justify-between text-sm">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'text-center flex-1',
              index <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-600',
            )}
          >
            {step.label}
          </div>
        ))}
      </div>
    </div>
  );
};

Stepper.displayName = 'Stepper';