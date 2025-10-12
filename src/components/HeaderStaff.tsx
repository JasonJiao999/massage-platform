// src/components/HeaderStaff.tsx
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { User } from '@supabase/supabase-js';

export default function HeaderStaff({ user }: { user: User | null }) {
  return (
    <header className="w-full flex justify-center border-b h-16 bg-card border-border">
      <div className="w-full max-w-6xl flex justify-between items-center p-3 text-sm text-foreground">
        {/* 左侧导航链接 */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold hover:underline">Home</Link>

          {/* 【核心改动】添加员工后台的导航链接 */}
          <div className="h-6 border-l border-gray-600"></div> {/* 分隔线 */}

          <Link href="/staff-dashboard/services" className="text-foreground/80 hover:text-white transition-colors">My Services</Link>
          <Link href="/staff-dashboard/schedule" className="text-gray-500 cursor-not-allowed">My Schedule</Link>
          <Link href="/staff-dashboard/profile" className="text-gray-500 cursor-not-allowed">My Profile</Link>
        </div>

        {/* 右侧用户信息和操作 */}
        <div className="flex items-center gap-4">
          <div id="google_translate_element"></div>
          {user && (
            <div className="flex items-center gap-4">
              Hey, {user.email}
              <LogoutButton logoutText="Logout" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}