// src/components/HeaderAdmin.tsx
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { User } from '@supabase/supabase-js';

export default function HeaderAdmin({ user }: { user: User | null }) {
  return (
    <header className="w-full flex justify-center border-b h-16 bg-card border-border">
      <div className="w-full max-w-6xl flex justify-between items-center p-3 text-sm text-foreground">
        <div>
          <Link href="/" className="font-bold hover:underline mr-4">Public Site</Link>
          <Link href="/admin/shops" className="text-foreground/80 hover:underline">Admin Console</Link>
        </div>
        <div className="flex items-center gap-4">
          <div id="google_translate_element"></div> {/* <-- 添加翻译插件容器 */}
          {user && (
            <div className="flex items-center gap-4">
              Hey, {user.email} <LogoutButton logoutText="Logout" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}