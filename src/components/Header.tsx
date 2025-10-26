'use client';

import { FC, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import LogoutButton from './LogoutButton'; // 確保 LogoutButton 組件存在

// 1. 定義 props 接口
interface HeaderProps {
  user: User | null;
  profile: { role: string | null } | null;
  logoUrl: string | null;
}

// 主 Header 組件
const Header: FC<HeaderProps> = ({ user, profile, logoUrl }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const displayLogoUrl = logoUrl || '/logo.svg';

  // 根據用戶角色獲取對應的後台鏈接
  const getDashboardLink = () => {
    const role = profile?.role;
    switch (role) {
      case 'admin': return { href: '/admin', name: '管理後台' };
      case 'merchant': return { href: '/dashboard', name: '商戶後台' };
      case 'staff': case 'freeman': return { href: '/staff-dashboard', name: '工作者後台' };
      case 'customer': return { href: '/customer-dashboard', name: '我的賬戶' };
      default: return null;
    }
  };

  const dashboardLink = getDashboardLink();

  // 桌面端和移動端共享的用戶信息/按鈕邏輯
  const UserActions = () => {
    if (user) {
      return (
        <div className="flex items-center gap-4">
          {/* 動態的後台導航按鈕 */}
          {dashboardLink && (
            <Link href={dashboardLink.href} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-semibold">
              {dashboardLink.name}
            </Link>
          )}
          {/* 用戶郵箱 */}
          <span className="text-sm text-gray-500">{user.email}</span>
          {/* 登出按鈕 */}
          <LogoutButton logoutText="登出" />
        </div>
      );
    }
    // 未登錄時的按鈕
    return (
      <div className="flex items-center space-x-4">
        <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm">登錄</Link>
        <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">註冊</Link>
      </div>
    );
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <Image src={displayLogoUrl} alt="Logo" width={140} height={80} className="h-10 w-auto" priority />
            </Link>
          </div>

          {/* 桌面端用戶操作區域 */}
          <div className="hidden md:flex items-center">
            <UserActions />
          </div>

          {/* 移動端漢堡菜單按鈕 */}


{/* 移動端漢堡菜單按鈕 */}
<div className="md:hidden">
  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
    <span className="sr-only">Open menu</span>

  
    
    {/* 1. 打开菜单的图标 (menu-open.svg) */}
    {/* 它只在 isMenuOpen 为 false 时显示 (class... 'block') */}
    <Image 
      src="/icons/menu-open.svg" 
      alt="打开菜单"
      width={24}
      height={24}
      className={`h-6 w-6 ${isMenuOpen ? 'hidden' : 'block'}`} 
    />

    {/* 2. 关闭菜单的图标 (menu-close.svg) */}
    {/* 它只在 isMenuOpen 为 true 时显示 (class... 'block') */}
    <Image 
      src="/icons/menu-close.svg" 
      alt="关闭菜单"
      width={24}
      height={24}
      className={`h-6 w-6 ${isMenuOpen ? 'block' : 'hidden'}`} 
    />
    
    

  </button>
</div>


        </div>
      </div>

      {/* 移動端展開菜單 */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 pt-4 pb-3">
             <UserActions />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;