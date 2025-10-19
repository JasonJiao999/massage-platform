// src/components/HeaderCustomer.tsx
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { User } from '@supabase/supabase-js';

export default function HeaderCustomer({ user }: { user: User | null }) {
  return (
    <header className="w-full flex justify-center border-b h-16 bg-card border-border">
      <div className="w-full max-w-6xl flex justify-between items-center p-3 text-sm text-foreground">
        <div className="flex items-center gap-4">
            <Link href="/" className="font-bold hover:underline">Home</Link>
            {/* 【核心修改】: 如果用户已登录，则显示“我的预约”链接 */}
            {user && (
                <Link href="/my-bookings" className="text-foreground/80 hover:underline">我的预约</Link>
            )}
        </div>
        <div className="flex items-center gap-4">
          <div id="google_translate_element"></div> {/* <-- 添加翻译插件容器 */}
          {user ? (
            <div className="flex items-center gap-4">
              Hey, {user.email} <LogoutButton logoutText="Logout" />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="py-2 px-3 rounded-md no-underline hover:bg-primary/10">Login</Link>
              <Link href="/register" className="py-2 px-3 rounded-md no-underline bg-indigo-600 text-white hover:bg-indigo-700">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}