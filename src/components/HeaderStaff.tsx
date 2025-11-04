// 文件路徑: src/components/HeaderStaff.tsx (已重構為導航卡片)
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HeaderStaff() {
  const pathname = usePathname();
  const navLinks = [
    { name: 'My Dashboard', href: '/staff-dashboard/' },
    { name: 'My Profile', href: '/staff-dashboard/profile' },
    { name: 'My Services', href: '/staff-dashboard/services' },
    { name: 'My schedule', href: '/staff-dashboard/schedule' },
    { name: 'Customer Management', href: '/staff-dashboard/bookings' },
  ];
  return (

    <div className="max-w-[1200px] mx-auto flex flex-row gap-[10px] px-[10px]">
      {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className={`block p-4 rounded-lg shadow-sm transition-all ${pathname.startsWith(link.href) ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}>
          <h3 className="btn">{link.name}</h3>
        </Link>
      ))}
    </div>
  );
}