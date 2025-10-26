// 文件路徑: src/components/HeaderAdmin.tsx (已重構為導航卡片)
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaStore, FaUserShield, FaImage, FaBullhorn } from 'react-icons/fa';

const navLinks = [
  { title: '商戶信息管理', href: '/admin/shops', icon: FaStore },
  { title: '用戶信息管理', href: '/admin/users', icon: FaUserShield },
  { title: '媒體管理', href: '/admin/media', icon: FaImage },
  { title: '廣告管理', href: '/admin/ads', icon: FaBullhorn },
];

export default function HeaderAdmin() {
  const pathname = usePathname();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {navLinks.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link key={link.title} href={link.href} className={`block p-4 rounded-lg shadow-sm transition-all ${isActive ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}>
            <div className="flex items-center space-x-3">
              <link.icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-blue-600'}`} />
              <div><h3 className="font-bold">{link.title}</h3></div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}