// src/components/Header.tsx

import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default function Header({ user }: { user: User | null }) {
  return (
    <header className="bg-white border-b">
      <nav className="container mx-auto px-4 flex justify-between items-center py-4">
        <Link href="/" className="font-bold text-xl">
          平台Logo
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/#features" className="text-sm font-medium hover:text-blue-600">功能介绍</Link>
          <Link href="/workers" className="text-sm font-medium hover:text-blue-600">寻找技师</Link>
          
          {/* 【核心修正】: 为 LogoutButton 提供 logoutText 属性 */}
          {user && <LogoutButton logoutText="登出" />}
        </div>
      </nav>
    </header>
  );
}