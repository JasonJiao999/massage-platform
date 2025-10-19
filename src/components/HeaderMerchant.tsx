// src/components/HeaderMerchant.tsx (已更新版)

import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

// 1. 【核心修改】: 更新组件的 props，增加 shopSlug
export default function HeaderMerchant({ user, shopSlug }: { user: User | null; shopSlug: string | null }) {
  return (
    <header className="bg-green-600 text-white">
      <nav className="container mx-auto px-4 flex justify-between items-center py-4">
        <Link href="/dashboard" className="font-bold text-xl">
          商户后台
        </Link>
        <div className="flex items-center gap-6">
          
          {/* 2. 【核心修改】: 如果 shopSlug 存在，则渲染链接 */}
          {shopSlug && (
            <Link
              href={`/shops/${shopSlug}`}
              className="text-sm font-medium hover:underline bg-white/20 px-3 py-1.5 rounded-md"
              target="_blank" // 在新标签页中打开，方便预览
              rel="noopener noreferrer"
            >
              商户专属页面
            </Link>
          )}

          <Link href="/dashboard/shop" className="text-sm font-medium hover:underline">我的店铺</Link>
          <Link href="/dashboard/staff" className="text-sm font-medium hover:underline">员工管理</Link>
          
          {user && <LogoutButton logoutText="登出" />}
        </div>
      </nav>
    </header>
  );
}