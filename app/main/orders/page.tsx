'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/page-header';
import { OrderTable } from '@/components/tables/order-table';
import { Badge } from '@/components/ui/badge';
import {
  BUY_ORDER_STATUS_LABELS,
  SELL_ORDER_STATUS_LABELS,
  MEDIATION_ORDER_STATUS_LABELS,
} from '@/constants/status';
import { Order } from '@/types/order';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export default function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOrderType, setFilterOrderType] = useState('');
  const [filterSalesPerson, setFilterSalesPerson] = useState('');
  const [salesUsers, setSalesUsers] = useState<User[]>([]);

  // 受注データを取得
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (filterStatus) params.append('status', filterStatus);
        if (filterOrderType) params.append('order_type', filterOrderType);

        const response = await fetch(`/api/orders?${params}`);
        const data = await response.json();

        console.log('📋 受注一覧データ:', data);

        if (data.success) {
          setOrders(data.data || []);
        } else {
          setError(data.error || '受注データの取得に失敗しました');
        }
      } catch (err) {
        console.error('❌ 受注一覧取得エラー:', err);
        setError('受注一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [filterStatus, filterOrderType]);

  // 営業ユーザーを取得
  useEffect(() => {
    const fetchSalesUsers = async () => {
      try {
        const response = await fetch('/api/users?role=sales');
        const data = await response.json();

        if (data.success) {
          setSalesUsers(data.data || []);
        }
      } catch (err) {
        console.error('❌ 営業ユーザー取得エラー:', err);
      }
    };

    fetchSalesUsers();
  }, []);

  // フィルタリング＆検索
  let filtered = orders;
  if (searchTerm) {
    filtered = filtered.filter((o) =>
      o.order_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (filterSalesPerson) {
    filtered = filtered.filter((o) => o.sales_person_id?.toString() === filterSalesPerson);
  }

  // 営業担当者オプション
  const salesPersonOptions = salesUsers.map((u) => ({
    value: u.id.toString(),
    label: u.name,
  }));

  // ステータスオプション（買い注文用）
  const buyStatusOptions = [
    { value: 'ordered', label: '受注済み' },
    { value: 'auction_processing', label: 'オークション手続中' },
    { value: 'purchase_recording', label: '仕入実績登録中' },
    { value: 'purchased', label: '仕入完了' },
    { value: 'shipment_preparing', label: '出荷準備中' },
    { value: 'shipping', label: '配送中' },
    { value: 'shipped', label: '配送完了' },
    { value: 'invoiced', label: '請求済み' },
    { value: 'partial_payment', label: '部分入金' },
    { value: 'payment_received', label: '入金完了' },
    { value: 'completed', label: '完了' },
  ];

  // 売り注文ステータスオプション
  const sellStatusOptions = [
    { value: 'ordered', label: '受注済み' },
    { value: 'vehicle_received', label: '車両預かり中' },
    { value: 'auction_processing', label: 'オークション手続中' },
    { value: 'sold', label: '売却完了' },
    { value: 'payment_notified', label: '支払通知済み' },
    { value: 'payment_completed', label: '支払完了' },
    { value: 'completed', label: '完了' },
  ];

  // 仲介売買ステータスオプション
  const mediationStatusOptions = [
    { value: 'ordered', label: '受注済み' },
    { value: 'matching', label: 'マッチング中' },
    { value: 'deal_established', label: '取引成立' },
    { value: 'invoiced', label: '請求済み' },
    { value: 'payment_received', label: '入金完了' },
    { value: 'payment_notified', label: '支払通知済み' },
    { value: 'payment_completed', label: '支払完了' },
    { value: 'completed', label: '完了' },
  ];

  // 注文種別に応じてステータスオプションを切り替え
  const getStatusOptions = () => {
    if (filterOrderType === 'sell') {
      return sellStatusOptions;
    }
    if (filterOrderType === 'mediation') {
      return mediationStatusOptions;
    }
    return buyStatusOptions;
  };

  // 注文種別オプション
  const orderTypeOptions = [
    { value: 'buy', label: '買い注文' },
    { value: 'sell', label: '売り注文' },
    { value: 'mediation', label: '仲介売買' },
  ];

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterOrderType('');
    setFilterSalesPerson('');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">読み込み中...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="受注一覧"
        subtitle="すべての受注を検索・管理"
        actions={
          <Link href="/main/orders/new/buy">
            <Button variant="primary">新規受注登録</Button>
          </Link>
        }
      />

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardBody>
            <p className="text-red-700">❌ {error}</p>
          </CardBody>
        </Card>
      )}

      {/* フィルタセクション */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">検索・フィルタ</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <Input
              placeholder="受注番号で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select
              options={orderTypeOptions}
              placeholder="注文種別"
              value={filterOrderType}
              onChange={(e) => setFilterOrderType(e.target.value)}
            />

            <Select
              options={getStatusOptions()}
              placeholder="ステータス"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            />

            <Select
              options={salesPersonOptions}
              placeholder="営業担当者"
              value={filterSalesPerson}
              onChange={(e) => setFilterSalesPerson(e.target.value)}
            />

            <Button
              variant="secondary"
              onClick={resetFilters}
              fullWidth
            >
              リセット
            </Button>
          </div>

          <p className="text-sm text-gray-600">
            検索結果: <span className="font-semibold">{filtered.length}</span>件
          </p>
        </CardBody>
      </Card>

      {/* 受注テーブル */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">受注データ</h2>
        </CardHeader>
        <CardBody className="p-0">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              該当する受注が見つかりません
            </div>
          ) : (
            <OrderTable orders={filtered} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}