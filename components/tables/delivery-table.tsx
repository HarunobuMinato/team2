'use client';

import React from 'react';
import Link from 'next/link';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Invoice } from '@/types/invoice';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading?: boolean;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  isLoading = false,
}) => {
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      issued: 'bg-blue-100 text-blue-800',
      sent: 'bg-blue-200 text-blue-900',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-400 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      draft: '下書き',
      issued: '発行済み',
      sent: '送付済み',
      paid: '支払済み',
      overdue: '期限切れ',
      cancelled: 'キャンセル',
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">請求書がありません</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>請求書番号</TableHeaderCell>
          <TableHeaderCell>発行日</TableHeaderCell>
          <TableHeaderCell>支払期限</TableHeaderCell>
          <TableHeaderCell align="right">金額</TableHeaderCell>
          <TableHeaderCell>ステータス</TableHeaderCell>
          <TableHeaderCell>操作</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium text-blue-600">
              {invoice.invoiceNumber}
            </TableCell>
            <TableCell className="text-sm text-gray-600">
              {formatDate(invoice.issuedDate)}
            </TableCell>
            <TableCell className="text-sm text-gray-600">
              {formatDate(invoice.dueDate)}
            </TableCell>
            <TableCell align="right" className="font-semibold">
              {formatCurrency(invoice.totalAmount)}
            </TableCell>
            <TableCell>
              <Badge variant={getStatusColor(invoice.status)}>
                {getStatusLabel(invoice.status)}
              </Badge>
            </TableCell>
            <TableCell>
              <Link href={`/main/invoices/${invoice.id}`}>
                <Button variant="ghost" size="sm">
                  詳細
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

InvoiceTable.displayName = 'InvoiceTable';