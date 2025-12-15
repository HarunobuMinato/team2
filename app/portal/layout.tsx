'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layouts/header';
import { PortalSidebar } from '@/components/layouts/portal-sidebar';
import { User } from '@/types/auth';
import { mockUsers } from '@/data/users';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // セッションストレージからユーザー情報を取得
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        // モックデータから詳細情報を取得
        const fullUser = mockUsers.find((u) => u.email === userData.email);
        if (fullUser) {
          setUser(fullUser);
        }
      } catch (err) {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">ローディング中...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-screen bg-gray-50">
      <PortalSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}