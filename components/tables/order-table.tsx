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
import { Order } from '@/types/order';
import {
  BUY_ORDER_STATUS_LABELS,
  BUY_ORDER_STATUS_COLORS,
  SELL_ORDER_STATUS_LABELS,
  SELL_ORDER_STATUS_COLORS,
  MEDIATION_ORDER_STATUS_LABELS,
  MEDIATION_ORDER_STATUS_COLORS,
} from '@/constants/status';
import { formatCurrency, formatDate } from '@/lib/utils';

interface OrderTableProps {
  orders: Order[];
  isLoading?: boolean;
  onRowClick?: (orderId: string) => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  isLoading = false,
  onRowClick,
}) => {
  const getStatusLabel = (order: Order): string => {
    if (order.order_type === 'buy') {
      return BUY_ORDER_STATUS_LABELS[order.status as any] || order.status;
    }
    if (order.order_type === 'sell') {
      return SELL_ORDER_STATUS_LABELS[order.status as any] || order.status;
    }
    return MEDIATION_ORDER_STATUS_LABELS[order.status as any] || order.status;
  };

  const getStatusColor = (order: Order): string => {
    if (order.order_type === 'buy') {
      return BUY_ORDER_STATUS_COLORS[order.status as any] || 'bg-gray-100 text-gray-800';
    }
    if (order.order_type === 'sell') {
      return SELL_ORDER_STATUS_COLORS[order.status as any] || 'bg-gray-100 text-gray-800';
    }
    return MEDIATION_ORDER_STATUS_COLORS[order.status as any] || 'bg-gray-100 text-gray-800';
  };

  const getOrderTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      buy: '買い注文',
      sell: '売り注文',
      mediation: '仲介売買',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">受注がありません</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>受注番号</TableHeaderCell>
          <TableHeaderCell>注文種別</TableHeaderCell>
          <TableHeaderCell>受注日</TableHeaderCell>
          <TableHeaderCell>希望納期</TableHeaderCell>
          <TableHeaderCell align="center">車両台数</TableHeaderCell>
          <TableHeaderCell align="right">金額</TableHeaderCell>
          <TableHeaderCell>ステータス</TableHeaderCell>
          <TableHeaderCell>操作</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium text-blue-600">
              {order.order_number}
            </TableCell>
            <TableCell>{getOrderTypeLabel(order.order_type)}</TableCell>
            <TableCell className="text-sm text-gray-600">
              {formatDate(order.order_date)}
            </TableCell>
            <TableCell className="text-sm text-gray-600">
              {order.desired_delivery_date
                ? formatDate(order.desired_delivery_date)
                : '-'}
            </TableCell>
            <TableCell align="center" className="font-semibold">
              {order.vehicle_count}台
            </TableCell>
            <TableCell align="right" className="font-semibold">
              {formatCurrency(order.total_amount || 0)}
            </TableCell>
            <TableCell>
              <Badge variant={getStatusColor(order)}>
                {getStatusLabel(order)}
              </Badge>
            </TableCell>
            <TableCell>
              <Link href={`/main/orders/${order.id}`}>
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

OrderTable.displayName = 'OrderTable';