'use client';

// 1. 導入 useRef 和 useEffect
import { FC, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import LogoutButton from './LogoutButton';
import GoogleTranslateWidget from "@/components/GoogleTranslateWidget";

interface HeaderProps {
  user: User | null;
  profile: { role: string | null } | null;
  logoUrl: string | null;
}

const Header: FC<HeaderProps> = ({ user, profile, logoUrl }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // 2. 創建一個 ref 用於移動端菜單
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  const displayLogoUrl = logoUrl || '/logo.svg';

  const getDashboardLink = () => {
    const role = profile?.role;
    switch (role) {
      case 'admin': return { href: '/admin', name: 'Admin Console' };
      case 'merchant': return { href: '/dashboard', name: 'Shop Dashboard' };
      case 'staff': case 'freeman': return { href: '/staff-dashboard', name: 'Worker Dashboard' };
      case 'customer': return { href: '/customer-dashboard', name: 'Profile' };
      default: return null;
    }
  };

  const dashboardLink = getDashboardLink();

  // 3. 實現「點擊外部關閉」的 Hook
  useEffect(() => {
    // 處理點擊外部事件
    const handleClickOutside = (event: MouseEvent) => {
      // 檢查點擊是否發生在 mobileMenuRef 之外
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false); // 關閉菜單
      }
    };

    // 只有當菜單打開時才添加監聽器
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // 組件卸載時清除監聽器
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]); // 依賴 isMenuOpen 狀態

  
  /**
   * 4. 修改 UserActions 組件
   * - 接受 isMobile 屬性
   * - 根據 isMobile 決定是水平佈局 (桌面) 還是垂直佈局 (移動端)
   */
  const UserActions = ({ isMobile = false }: { isMobile?: boolean }) => {
    
    // 【已登錄】
    if (user) {
      if (isMobile) {
        // 【移動端 - 垂直佈局】
        return (
          <div className="flex flex-col w-full p-2">
            <span className="btn" title={user.email}>{user.email}</span>
            {dashboardLink && (
              <Link href={dashboardLink.href} className="btn">
                {dashboardLink.name}
              </Link>
            )}
            {/* 假設 LogoutButton 可以接受 className 來進行樣式設置 */}
            <LogoutButton 
              logoutText="Logout" 
              className="block w-full text-center " 
            />
          </div>
        );
      }
      
      // 【桌面端 - 水平佈局】(同時清理了原來的 <ul> 結構)
      return (
        <div className="max-w-[1200px] mx-auto flex flex-row gap-4 items-center px-[10px]">
          <span className="btn" title={user.email}>{user.email}</span>
          {dashboardLink && (
            <Link href={dashboardLink.href} className="btn">
              {dashboardLink.name}
            </Link>
          )}
          <LogoutButton logoutText="Logout" />
        </div>
      );
    }

    // 【未登錄】
    if (isMobile) {
      // 【移動端 - 垂直佈局】
      return (
        <div className="flex flex-col gap-2 p-2">
          <Link href="/login" className="btn"> 
            Login
          </Link>
          <Link href="/register" className="btn">
            Register
          </Link>
        </div>
      );
    }

    // 【桌面端 - 水平佈局】
    return (
      <div className="max-w-[1200px] mx-auto flex flex-row gap-[10px] py-[10px]">
        <Link href="/login" className="btn">
         Login
        </Link>
        <Link href="/register" className= "btn">
         Register
        </Link>
      </div>
    );
  };


  return (
    <header className="card bg-primary max-w-[1200px] mx-auto flex flex-row gap-[10px] py-[10px] m-[10px]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 mx-[10px]">
            <Link href="/">
              <Image src={displayLogoUrl} alt="Logo" width={140} height={80} className="h-10 w-auto" priority />
            </Link>
          </div>

          {/* 桌面端用戶操作區域 */}
          <div className="hidden md:flex items-center">
            {/* 傳遞 isMobile={false} (或不傳，默認為 false) */}
            <UserActions />
          </div>

          {/* 5. 修改移動端漢堡菜單區域 */}
          <div className="md:hidden relative" ref={mobileMenuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="mx-[20px] rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <span className="sr-only">Open menu</span>
              
              {/* 打開菜單的圖標 (menu-open.svg) */}
              <Image 
                src="/icons/menu-open.svg" 
                alt="Open Menu"
                width={24}
                height={24}
                className={`h-6 w-6 ${isMenuOpen ? 'hidden' : 'block'}`} 
              />
              {/* 關閉菜單的圖標 (menu-close.svg) */}
              <Image 
                src="/icons/menu-close.svg" 
                alt="Close Menu"
                width={24}
                height={24}
                className={`h-6 w-6 ${isMenuOpen ? 'block' : 'hidden'}`} 
              />
            </button>

            {/* 6. 【核心修復】
                將菜單改為絕對定位的彈出框 (Popover)
                它現在會顯示在按鈕正下方
            */}
            {isMenuOpen && (
              <div 
                className="absolute top-full right-[20px] left-4 mt-2 rounded-md  ring-1 ring-black ring-opacity-5 z-50"
              >
                {/* 傳遞 isMobile={true} */}
                <UserActions isMobile={true} />
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;