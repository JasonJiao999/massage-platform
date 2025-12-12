// 文件路徑: src/components/HeaderStaff.tsx (已使用静态字典进行国际化)
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react'; 

// 静态翻译字典 (核心实现)
const translations = {
  en: {
    dashboard: 'My Dashboard',
    messages: 'My Messages',
    profile: 'My Profile',
    media: 'My Media',
    services: 'My Services',
    schedule: 'My schedule',
    bookings: 'Customer Management',
  },
  th: { // 泰语翻译示例
    dashboard: 'แดชบอร์ดของฉัน',
    messages: 'ข้อความของฉัน',
    profile: 'โปรไฟล์ของฉัน',
    media: 'สื่อของฉัน',
    services: 'บริการของฉัน',
    schedule: 'ตารางงานของฉัน',
    bookings: 'การจัดการลูกค้า',
  },
  // 【新增】: 中文繁体翻译
  'zh-TW': {
    dashboard: '我的控制台',
    messages: '我的訊息',
    profile: '我的檔案',
    media: '我的媒體',
    services: '我的服務',
    schedule: '我的排班',
    bookings: '客戶管理',
  },
};

export default function HeaderStaff() {
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

  // 定义导航链接，根据当前语言获取翻译
  const navLinks = [
    { 
      name: translations[currentLanguage as keyof typeof translations].dashboard, 
      href: '/staff-dashboard/' 
    },
    //{ 
      //name: translations[currentLanguage as keyof typeof translations].messages, 
      //href: '/staff-dashboard/messages' 
    //}, 
    { 
      name: translations[currentLanguage as keyof typeof translations].profile, 
      href: '/staff-dashboard/profile' 
    },
    { 
      name: translations[currentLanguage as keyof typeof translations].media, 
      href: '/staff-dashboard/media' 
    },
    { 
      name: translations[currentLanguage as keyof typeof translations].services, 
      href: '/staff-dashboard/services' 
    },
    { 
      name: translations[currentLanguage as keyof typeof translations].schedule, 
      href: '/staff-dashboard/schedule' 
    },
    //{  
    //  name: translations[currentLanguage as keyof typeof translations].bookings, 
    //  href: '/staff-dashboard/bookings' 
    //},
  ];
  
  return (
    <div className="max-w-[1200px] mx-auto flex flex-wrap gap-[10px] px-[10px]">
      {navLinks.map((link) => (
        <Link 
          key={link.href} 
          href={link.href} 
          className={`block p-4 rounded-lg shadow-sm transition-all ${pathname.startsWith(link.href) ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
        >
          <h3 className="btn">{link.name}</h3>
        </Link>
      ))}
    </div>
  );
}