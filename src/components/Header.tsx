// src/components/Header.tsx
'use client';

import { FC, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import LogoutButton from './LogoutButton';

interface HeaderProps {
  user: User | null;
  profile: { role: string | null } | null;
  logoUrl: string | null;
}

// 简单的翻译函数，避免使用 react-i18next
const translations = {
  en: {
    login: "Login",
    register: "Register", 
    logout: "Logout",
    adminDashboard: "Admin Dashboard",
    shopDashboard: "Shop Dashboard",
    workerDashboard: "Worker Dashboard",
    profile: "Profile"
  },
  th: {
    login: "เข้าสู่ระบบ",
    register: "สมัครสมาชิก",
    logout: "ออกจากระบบ", 
    adminDashboard: "แผงควบคุมผู้ดูแล",
    shopDashboard: "แดชบอร์ดร้านค้า",
    workerDashboard: "แดชบอร์ดพนักงาน",
    profile: "โปรไฟล์"
  },
  'zh-TW': {
    login: "登入",
    register: "註冊",
    logout: "登出",
    adminDashboard: "儀表板", 
    shopDashboard: "儀表板",
    workerDashboard: "儀表板",
    profile: "個人資料"
  }
};

const Header: FC<HeaderProps> = ({ user, profile, logoUrl }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  const displayLogoUrl = logoUrl || '/logo.svg';

  // 在 useEffect 中设置语言，避免服务端/客户端不匹配
  useEffect(() => {
    // 只根据浏览器语言设置，不再使用 localStorage
    const browserLanguage = navigator.language;
    
    if (browserLanguage.startsWith('th')) {
      setCurrentLanguage('th');
    } else if (browserLanguage.startsWith('zh-TW')) {
      setCurrentLanguage('zh-TW');
    } else {
      setCurrentLanguage('en');
    }
  }, []);

  const getDashboardLink = () => {
    const role = profile?.role;
    const t = translations[currentLanguage as keyof typeof translations];
    
    switch (role) {
      case 'admin': return { href: '/admin', name: t.adminDashboard };
      case 'merchant': return { href: '/dashboard', name: t.shopDashboard };
      case 'staff': case 'freeman': return { href: '/staff-dashboard', name: t.workerDashboard };
      case 'customer': return { href: '/customer-dashboard', name: t.profile };
      default: return null;
    }
  };

  const dashboardLink = getDashboardLink();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const UserActions = ({ isMobile = false }: { isMobile?: boolean }) => {
    const t = translations[currentLanguage as keyof typeof translations];
    
    if (user) {
      if (isMobile) {
        return (
          <div className="flex flex-col w-full gap-[10px] bg-[var(--color-third:)]">
            <span className="btn" title={user.email}>{user.email}</span>
            {dashboardLink && (
              <Link href={dashboardLink.href} className="btn no-underline">
                {dashboardLink.name}
              </Link>
            )}
            <LogoutButton 
              logoutText={t.logout} 
              className="block w-full text-center" 
            />
          </div>
        );
      }
      
      return (
        <div className="max-w-[1200px] mx-auto flex flex-row items-center">
          <span className="btn" title={user.email}>{user.email}</span>
          {dashboardLink && (
            <Link href={dashboardLink.href} className="btn no-underline">
              {dashboardLink.name}
            </Link>
          )}
          <LogoutButton logoutText={t.logout} />
        </div>
      );
    }

    if (isMobile) {
      return (
        <div className="flex flex-col gap-[10px]">
          <Link href="/login" className="btn no-underline"> 
            {t.login}
          </Link>
          <Link href="/register" className="btn no-underline">
            {t.register}
          </Link>
        </div>
      );
    }

    return (
      <div className="max-w-[1200px] mx-auto flex flex-row gap-[10px] py-[10px]">
        <Link href="/login" className="btn">
          {t.login}
        </Link>
        <Link href="/register" className="btn">
          {t.register}
        </Link>
      </div>
    );
  };

  return (
    <header className="card bg-primary w-full flex flex-row gap-[10px] my-[10px] ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 mx-[10px]">
            <Link href="/">
              <Image src={displayLogoUrl} alt="Logo" width={260} height={85} priority />
            </Link>
          </div>

          <div className="hidden md:flex items-center">
            <UserActions />
          </div>

          <div className="md:hidden flex items-center">
            <div className="relative " ref={mobileMenuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="btn btn-square mx-[20px] bg-[var(--background)] hover:text-gray-900 hover:bg-gray-100 border-[5px] border-[var(--color-overimg)]"
              >
                <span className="sr-only">Open menu</span>
                <Image 
                  src="/icons/menu-open.svg" 
                  alt="Open Menu"
                  width={24}
                  height={24}
                  className={`h-6 w-6 ${isMenuOpen ? 'hidden' : 'block'}`} 
                />
                <Image 
                  src="/icons/menu-close.svg" 
                  alt="Close Menu"
                  width={24}
                  height={24}
                  className={`h-6 w-6 ${isMenuOpen ? 'block' : 'hidden'}`} 
                />
              </button>

              {isMenuOpen && (
                <div className="absolute top-full right-[20px] card bg-[var(--color-third)] p-[10px] z-50">
                  <UserActions isMobile={true} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;