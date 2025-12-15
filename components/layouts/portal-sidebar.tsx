'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PortalSidebarItem {
  label: string;
  href: string;
  icon?: string;
}

const portalMenuItems: PortalSidebarItem[] = [
  {
    label: 'ダッシュボード',
    href: '/portal',
    icon: '📊',
  },
  {
    label: '注文管理',
    href: '/portal/orders',
    icon: '📋',
  },
  {
    label: '納品・検収',
    href: '/portal/deliveries',
    icon: '📄',
  },
  {
    label: '請求書',
    href: '/portal/invoices',
    icon: '💰',
  },
  {
    label: '支払通知書',
    href: '/portal/payment-notices',
    icon: '📧',
  },
];

interface PortalSidebarProps {
  isCollapsed?: boolean;
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({ isCollapsed = false }) => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  if (isCollapsed) {
    return (
      <aside className="w-16 bg-gray-900 text-white py-6">
        <nav className="space-y-4">
          {portalMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-center h-12 transition-colors rounded-lg mx-2',
                isActive(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white',
              )}
              title={item.label}
            >
              {item.icon}
            </Link>
          ))}
        </nav>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gray-900 text-white py-6">
      <nav className="space-y-1 px-3">
        {portalMenuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
              isActive(item.href)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800',
            )}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

PortalSidebar.displayName = 'PortalSidebar';