'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-left text-sm text-gray-900">{children}</table>
    </div>
  );
};

Table.displayName = 'Table';

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export const TableHead: React.FC<TableHeadProps> = ({ children, className }) => {
  return (
    <thead
      className={cn('border-b border-gray-300 bg-gray-50 text-xs font-semibold uppercase', className)}
    >
      {children}
    </thead>
  );
};

TableHead.displayName = 'TableHead';

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={cn('divide-y divide-gray-200', className)}>{children}</tbody>;
};

TableBody.displayName = 'TableBody';

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  isHoverable?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  className,
  isHoverable = true,
}) => {
  return (
    <tr className={cn(isHoverable && 'hover:bg-gray-50', className)}>{children}</tr>
  );
};

TableRow.displayName = 'TableRow';

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className,
  align = 'left',
}) => {
  const alignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <td className={cn('px-4 py-3', alignClass, className)}>{children}</td>
  );
};

TableCell.displayName = 'TableCell';

interface TableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  children,
  className,
  align = 'left',
}) => {
  const alignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <th className={cn('px-4 py-3 font-semibold', alignClass, className)}>
      {children}
    </th>
  );
};

TableHeaderCell.displayName = 'TableHeaderCell';