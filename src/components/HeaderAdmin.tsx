// 文件路徑: src/components/HeaderAdmin.tsx (已重構為導航卡片)
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaStore, FaUserShield, FaImage, FaBullhorn } from 'react-icons/fa';

const navLinks = [
  { title: '控制台', href: '/admin', icon: FaStore },
  { title: '商戶信息管理', href: '/admin/shops', icon: FaStore },
  { title: '用戶信息管理', href: '/admin/users', icon: FaUserShield },
  { title: '媒體管理', href: '/admin/media', icon: FaImage },
  { title: '廣告管理', href: '/admin/ads', icon: FaBullhorn },
];

export default function HeaderAdmin() {
  const pathname = usePathname();
  return (
    <div className="max-w-[1200px] mx-auto flex flex-row gap-[10px] px-[10px]">
      {navLinks.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link key={link.title} href={link.href} className={`block p-4 rounded-lg shadow-sm transition-all ${isActive ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}>
            <div className="flex items-center space-x-3">
              
              <div><h3 className="btn">{link.title}</h3></div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}