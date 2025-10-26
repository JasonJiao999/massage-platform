// 文件路徑: src/components/HeaderCustomer.tsx (已重構為導航卡片)
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HeaderCustomer() {
  const pathname = usePathname();
  const navLinks = [
    { name: '我的預約', href: '/customer-dashboard/my-bookings' },
    { name: '我的信息', href: '/customer-dashboard/profile' },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      {navLinks.map((link) => (
        <Link key={link.name} href={link.href} className={`block p-4 rounded-lg shadow-sm transition-all ${pathname.startsWith(link.href) ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-50'}`}>
          <h3 className="font-bold">{link.name}</h3>
        </Link>
      ))}
    </div>
  );
}