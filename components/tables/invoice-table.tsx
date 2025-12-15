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
import {
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
} from '@/constants/status';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading?: boolean;
  onRowClick?: (invoiceId: string) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  isLoading = false,
  onRowClick,
}) => {
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
          <TableHeaderCell>請求日</TableHeaderCell>
          <TableHeaderCell>期日</TableHeaderCell>
          <TableHeaderCell align="right">金額</TableHeaderCell>
          <TableHeaderCell align="right">支払済み</TableHeaderCell>
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
              {formatDate(invoice.invoiceDate)}
            </TableCell>
            <TableCell className="text-sm text-gray-600">
              {formatDate(invoice.dueDate)}
            </TableCell>
            <TableCell align="right" className="font-semibold">
              {formatCurrency(invoice.totalAmount)}
            </TableCell>
            <TableCell align="right" className="font-semibold">
              {formatCurrency(invoice.paidAmount)}
            </TableCell>
            <TableCell>
              <Badge variant={INVOICE_STATUS_COLORS[invoice.status]}>
                {INVOICE_STATUS_LABELS[invoice.status]}
              </Badge>
            </TableCell>
            <TableCell>
              <Link href={`/invoices/${invoice.id}`}>
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