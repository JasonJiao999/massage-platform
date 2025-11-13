// 文件路徑: src/components/HeaderMerchant.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HeaderMerchant({ shopSlug }: { shopSlug: string | null }) {
  const pathname = usePathname();
  const navLinks = [
    { name: 'My console', href: '/dashboard/' },
    { name: 'Team Information', href: '/dashboard/shop' },
    { name: 'Team Page', href: shopSlug ? `/shops/${shopSlug}` : '#', target: '_blank'}, // target 在这里定义
    { name: 'My Team', href: '/dashboard/staff' },
    { name: 'My Profile', href: '/dashboard/profile' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto flex flex-row flex-wrap gap-[10px] px-[10px]">
      {navLinks.map((link) => (
        <Link 
          key={link.name} 
          href={link.href}
          target={link.target} // <-- 修正点 1: 传递 target
          rel={link.target === '_blank' ? 'noopener noreferrer' : undefined} // <-- 修正点 2: 添加 rel
          className={`block p-4 rounded-lg shadow-sm transition-all ${
            pathname.startsWith(link.href) 
              ? 'bg-green-600 text-white' 
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          {/* 注意：使用 <h3> 作为按钮在语义上不标准，但功能上可行 */}
          {/* 如果 'btn' 只是样式，可以考虑用 <span> */}
          <h3 className="btn">{link.name}</h3> 
        </Link>
      ))}
    </div>
  );
}