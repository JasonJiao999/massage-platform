// 文件路徑: src/components/HeaderStaff.tsx (已重構為導航卡片)
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HeaderStaff() {
  const pathname = usePathname();
  const navLinks = [
    { name: '我的檔案', href: '/staff-dashboard/profile' },
    { name: '我的服務', href: '/staff-dashboard/services' },
    { name: '我的排班', href: '/staff-dashboard/schedule' },
    { name: '預約管理', href: '/staff-dashboard/bookings' },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {navLinks.map((link) => (
        <Link key={link.name} href={link.href} className={`block p-4 rounded-lg shadow-sm transition-all ${pathname.startsWith(link.href) ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}>
          <h3 className="font-bold">{link.name}</h3>
        </Link>
      ))}
    </div>
  );
}