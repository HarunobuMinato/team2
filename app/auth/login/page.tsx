'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { demoUsers } from '@/data/users';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // デモ用：メール・パスワードの検証
      const user = demoUsers.find(
        (u) => u.email === email && u.password === password,
      );

      if (!user) {
        setError('メールアドレスまたはパスワードが正しくありません');
        setIsLoading(false);
        return;
      }

      // ログイン成功時：ユーザー情報をセッションストレージに保存
      // （実際にはバックエンドで認証し、tokenを取得）
      sessionStorage.setItem(
        'user',
        JSON.stringify({
          id: 'user-001',
          email,
          name: user.name,
          role: email === 'customer@example.com' ? 'customer' : email === 'vendor@example.com' ? 'vendor' : 'admin',
        }),
      );

      // ロールに応じてリダイレクト
      if (email === 'customer@example.com' || email === 'vendor@example.com') {
        router.push('/portal/portal');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🚗</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">車両売買システム</h1>
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
                ログイン
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