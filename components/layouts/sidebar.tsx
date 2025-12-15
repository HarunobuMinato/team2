'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarItem {
  label: string;
  href: string;
  icon?: string;
  children?: SidebarItem[];
}

const mainMenuItems: SidebarItem[] = [
  {
    label: 'ダッシュボード',
    href: '/main',
    icon: '📊',
  },
  {
    label: '受注管理',
    href: '/main/orders',
    icon: '📋',
    children: [
      {
        label: '受注一覧',
        href: '/main/orders',
      },
      {
        label: '受注登録',
        href: '/main/orders/new/buy',
      },
    ],
  },
  {
    label: '仕入れ管理',
    href: '/main/purchases',
    icon: '📦',
    children: [
      {
        label: '仕入れ一覧',
        href: '/main/purchases',
      },
      {
        label: '仕入れ登録',
        href: '/main/purchases/new',
      },
    ],
  },
  {
    label: '納品書管理',
    href: '/main/deliveries',
    icon: '📄',
    children: [
      {
        label: '納品書一覧',
        href: '/main/deliveries',
      },
      {
        label: '納品書作成',
        href: '/main/deliveries/new',
      },
    ],
  },
  {
    label: '検収管理',
    href: '/main/inspections',
    icon: '✓',
  },
  {
    label: '請求管理',
    href: '/main/invoices',
    icon: '💰',
    children: [
      {
        label: '請求一覧',
        href: '/main/invoices',
      },
      {
        label: '請求書発行',
        href: '/main/invoices/new',
      },
    ],
  },
  {
    label: '入金管理',
    href: '/main/payments',
    icon: '🏦',
    children: [
      {
        label: '入金一覧',
        href: '/main/payments',
      },
      {
        label: '入金登録',
        href: '/main/payments/new',
      },
    ],
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const toggleExpand = (href: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(href)) {
      newExpanded.delete(href);
    } else {
      newExpanded.add(href);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  if (isCollapsed) {
    return (
      <aside className="w-16 bg-gray-900 text-white py-6">
        <nav className="space-y-4">
          {mainMenuItems.map((item) => (
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
    <aside className="w-64 bg-gray-900 text-white py-6 overflow-y-auto">
      <nav className="space-y-1 px-3">
        {mainMenuItems.map((item) => (
          <div key={item.href}>
            {item.children ? (
              <>
                <button
                  onClick={() => toggleExpand(item.href)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors text-left',
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <svg
                    className={cn(
                      'w-4 h-4 transition-transform',
                      expandedItems.has(item.href) && 'rotate-180',
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>
                {expandedItems.has(item.href) && (
                  <div className="ml-4 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'block px-4 py-2 rounded-lg transition-colors text-sm',
                          isActive(child.href)
                            ? 'bg-blue-600 text-white font-medium'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800',
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
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
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

Sidebar.displayName = 'Sidebar';