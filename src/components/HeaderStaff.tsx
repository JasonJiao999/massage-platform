// src/components/HeaderStaff.tsx
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default function HeaderStaff({ user }: { user: User | null }) {
  return (
    <header className="bg-blue-600 text-white">
      <nav className="container mx-auto px-4 flex justify-between items-center py-4">
        <Link href="/staff-dashboard" className="font-bold text-xl">
          员工后台
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/staff-dashboard/profile" className="text-sm font-medium hover:underline">我的档案</Link>
          <Link href="/staff-dashboard/services" className="text-sm font-medium hover:underline">我的服务</Link>
          <Link href="/staff-dashboard/schedule" className="text-sm font-medium hover:underline">我的排班</Link>
          {/* 【核心修改】: 添加“预约管理”链接 */}
          <Link href="/staff-dashboard/bookings" className="text-sm font-medium hover:underline">预约管理</Link>
          
          {user && (
            <div className='flex items-center gap-4'>
              <span className='text-sm'>{user.email}</span>
              <LogoutButton logoutText="登出" />
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}