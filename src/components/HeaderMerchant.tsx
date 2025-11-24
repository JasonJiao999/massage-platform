// 文件路徑: src/components/HeaderMerchant.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

// 静态翻译字典
const translations = {
  en: {
    myConsole: 'My console',
    teamInformation: 'Team Information',
    teamPage: 'Team Page',
    myTeam: 'My Team',
    myProfile: 'My Profile'
  },
  th: {
    myConsole: 'คอนโซลของฉัน',
    teamInformation: 'ข้อมูลทีม',
    teamPage: 'หน้าทีม',
    myTeam: 'ทีมของฉัน',
    myProfile: 'โปรไฟล์ของฉัน'
  },
  'zh-TW': {
    myConsole: '我的控制台',
    teamInformation: '團隊資訊',
    teamPage: '團隊頁面',
    myTeam: '我的團隊',
    myProfile: '我的檔案'
  }
};

export default function HeaderMerchant({ shopSlug }: { shopSlug: string | null }) {
  const pathname = usePathname();
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // 根据浏览器语言自动设置语言
  useEffect(() => {
    const browserLanguage = navigator.language;
    
    if (browserLanguage.startsWith('th')) {
      setCurrentLanguage('th');
    } else if (browserLanguage.startsWith('zh-TW')) {
      setCurrentLanguage('zh-TW');
    } else {
      setCurrentLanguage('en');
    }
  }, []);

  const t = translations[currentLanguage as keyof typeof translations];

  const navLinks = [
    { name: t.myConsole, href: '/dashboard/' },
    { name: t.teamInformation, href: '/dashboard/shop' },
    { name: t.teamPage, href: shopSlug ? `/shops/${shopSlug}` : '#', target: '_blank' },
    { name: t.myTeam, href: '/dashboard/staff' },
    { name: t.myProfile, href: '/dashboard/profile' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto flex flex-row flex-wrap gap-[10px] px-[10px]">
      {navLinks.map((link) => (
        <Link 
          key={link.name} 
          href={link.href}
          target={link.target}
          rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
          className={`block p-4 rounded-lg shadow-sm transition-all ${
            pathname.startsWith(link.href) 
              ? 'bg-green-600 text-white' 
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          <h3 className="btn">{link.name}</h3>
        </Link>
      ))}
    </div>
  );
}