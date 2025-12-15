'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
      {children}
    </div>
  );
};

Card.displayName = 'Card';

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return <div className={cn('px-6 py-4 border-b border-gray-200', className)}>{children}</div>;
};

CardHeader.displayName = 'CardHeader';

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className }) => {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
};

CardBody.displayName = 'CardBody';

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return <div className={cn('px-6 py-4 border-t border-gray-200 bg-gray-50', className)}>{children}</div>;
};

CardFooter.displayName = 'CardFooter';