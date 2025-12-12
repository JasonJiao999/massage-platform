// 文件路徑: src/components/HeaderCustomer.tsx (已重構為導航卡片)
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HeaderCustomer() {
  const pathname = usePathname();
  const navLinks = [
    { name: 'Favorites', href: '/customer-dashboard/' },
   // { name: 'Messages', href: '/customer-dashboard/messages' },
   // { name: 'Booking', href: '/customer-dashboard/my-bookings' },

  ];
  return (
    <div className="w-[full-20px] gap-[10px] m-[10px] flex items-center ">
      {navLinks.map((link) => (
        <Link key={link.name} href={link.href} className={`block p-4 rounded-lg shadow-sm transition-all ${pathname.startsWith(link.href) ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-50'}`}>
          <h3 className="btn">{link.name}</h3>
        </Link>
      ))}
    </div>
  );
}