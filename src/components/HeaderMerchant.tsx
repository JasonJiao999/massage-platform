// src/components/HeaderMerchant.tsx

import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default function HeaderMerchant({ user }: { user: User | null }) {
  return (
    <header className="bg-green-600 text-white">
      <nav className="container mx-auto px-4 flex justify-between items-center py-4">
        <Link href="/dashboard" className="font-bold text-xl">
          商户后台
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard/shop" className="text-sm font-medium hover:underline">我的店铺</Link>
          <Link href="/dashboard/staff" className="text-sm font-medium hover:underline">员工管理</Link>
          
          {/* 【核心修正】: 为 LogoutButton 提供 logoutText 属性 */}
          {user && <LogoutButton logoutText="登出" />}
        </div>
      </nav>
    </header>
  );
}