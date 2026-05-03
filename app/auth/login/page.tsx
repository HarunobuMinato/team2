'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardBody, CardHeader } from '@/components/ui/card';

interface AuthResponse {
  success: boolean;
  data?: {
    id: number;
    email: string;
    name: string;
    role: string;
    client_id?: number;
  };
  error?: string;
}

interface DemoUser {
  email: string;
  name: string;
  password: string;
  role: string;
}

// デモアカウント（DBから取得する前提）
const demoUsers: DemoUser[] = [
  {
    email: 'customer@example.com',
    name: '顧客 太郎',
    password: 'password123',
    role: 'customer',
  },
  {
    email: 'vendor@example.com',
    name: 'ベンダー 花子',
    password: 'password123',
    role: 'vendor',
  },
  {
    email: 'admin@example.com',
    name: '管理者 次郎',
    password: 'password123',
    role: 'admin',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  /**
   * ログイン処理
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔄 ログイン処理開始:', email);

      // API を呼び出し
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as AuthResponse;

      if (!response.ok || !data.success) {
        console.error('❌ ログイン失敗:', data.error);
        setError(data.error || 'ログインに失敗しました');
        setIsLoading(false);
        return;
      }

      if (!data.data) {
        setError('ユーザー情報の取得に失敗しました');
        setIsLoading(false);
        return;
      }

      console.log('🔐 ユーザー情報取得成功:', data.data);
      // ログイン成功：ユーザー情報をセッションストレージに保存
      const userInfo = {
        id: data.data.id,
        email: data.data.email,
        name: data.data.name,
        role: data.data.role,
        client_id: (data.data as any).client_id,
      };

      console.log('✅ ログイン成功:', userInfo);

      sessionStorage.setItem('user', JSON.stringify(userInfo));

      // ロールに応じてリダイレクト
      if (data.data.role === 'customer' || data.data.role === 'vendor') {
        console.log('📍 カスタマーポータルへリダイレクト');
        router.push('/portal');
      } else if (data.data.role === 'admin' || data.data.role === 'sales') {
        console.log('📍 管理画面へリダイレクト');
        router.push('/main');
      } else {
        console.log('📍 ダッシュボードへリダイレクト');
        router.push('/');
      }
    } catch (err) {
      console.error('❌ ログインエラー:', err);
      setError('ログイン処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * デモアカウントでクイックログイン
   */
  const quickLogin = (demoEmail: string) => {
    const user = demoUsers.find((u) => u.email === demoEmail);
    if (user) {
      setEmail(user.email);
      setPassword(user.password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🚗</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            車両売買システム
          </h1>
          <p className="text-gray-600">受注・請求・入金管理システム</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900">ログイン</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <Input
                label="メールアドレス"
                type="email"
                placeholder="example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="パスワード"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                className="mt-6"
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </Button>

              <Link
                href="/reset-password"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                パスワードをお忘れですか？
              </Link>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-3">
                📝 デモアカウントでお試しください
              </p>
              <div className="space-y-2">
                {demoUsers.map((user) => (
                  <button
                    key={user.email}
                    type="button"
                    onClick={() => quickLogin(user.email)}
                    className="w-full p-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-gray-500 text-xs">{user.email}</div>
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-6">
          © 2024 車両売買システム. All rights reserved.
        </p>
      </div>
    </div>
  );
}