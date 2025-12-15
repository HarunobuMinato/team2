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
import { Delivery } from '@/types/delivery';
import {
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_COLORS,
} from '@/constants/status';
import { formatCurrency, formatDate } from '@/lib/utils';

interface DeliveryTableProps {
  deliveries: Delivery[];
  isLoading?: boolean;
  onRowClick?: (deliveryId: string) => void;
}

export const DeliveryTable: React.FC<DeliveryTableProps> = ({
  deliveries,
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

  if (deliveries.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">納品書がありません</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>納品書番号</TableHeaderCell>
          <TableHeaderCell>納品日</TableHeaderCell>
          <TableHeaderCell align="right">金額</TableHeaderCell>
          <TableHeaderCell>ステータス</TableHeaderCell>
          <TableHeaderCell>操作</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {deliveries.map((delivery) => (
          <TableRow key={delivery.id}>
            <TableCell className="font-medium text-blue-600">
              {delivery.deliveryNumber}
            </TableCell>
            <TableCell className="text-sm text-gray-600">
              {formatDate(delivery.deliveryDate)}
            </TableCell>
            <TableCell align="right" className="font-semibold">
              {formatCurrency(delivery.totalAmount)}
            </TableCell>
            <TableCell>
              <Badge variant={DELIVERY_STATUS_COLORS[delivery.status]}>
                {DELIVERY_STATUS_LABELS[delivery.status]}
              </Badge>
            </TableCell>
            <TableCell>
              <Link href={`/deliveries/${delivery.id}`}>
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

DeliveryTable.displayName = 'DeliveryTable';