// 文件路徑: src/components/HeaderMerchant.tsx (已重構為導航卡片)
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HeaderMerchant({ shopSlug }: { shopSlug: string | null }) {
  const pathname = usePathname();
  const navLinks = [
    { name: '我的店鋪', href: '/dashboard/shop' },
    { name: '員工管理', href: '/dashboard/staff' },
    { name: '商戶專屬頁面', href: shopSlug ? `/shops/${shopSlug}` : '#' },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {navLinks.map((link) => (
        <Link key={link.name} href={link.href} className={`block p-4 rounded-lg shadow-sm transition-all ${pathname.startsWith(link.href) ? 'bg-green-600 text-white' : 'bg-white hover:bg-gray-50'}`}>
          <h3 className="font-bold">{link.name}</h3>
        </Link>
      ))}
    </div>
  );
}