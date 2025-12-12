// 文件路徑: src/components/AdminNav.tsx (已修正語法錯誤)

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaStore, FaUserShield, FaImage, FaBullhorn } from 'react-icons/fa';

const navLinks = [
  { title: '商戶信息管理', href: '/admin/shops', icon: FaStore, description: '搜索、編輯商戶' },
  { title: '用戶信息管理', href: '/admin/users', icon: FaUserShield, description: '管理所有用戶賬號' },
  { title: '媒體管理', href: '/admin/media', icon: FaImage, description: '上傳 Logo、廣告等' },
  { title: '廣告管理', href: '/admin/ads', icon: FaBullhorn, description: '設置激活的橫幅' },
];

const AdminNav = () => {
  const pathname = usePathname();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {navLinks.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.title}
            href={link.href}
            className={`block p-4 rounded-lg shadow-sm transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white hover:bg-gray-50 hover:shadow-md'
            }`}
          >
            <div className="max-w-[1200px] mx-auto flex flex-row gap-[10px] px-[10px]">
              <link.icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-blue-600'}`} />
              <div>
                <h3 className="btn">{link.title}</h3>
                <p className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>{link.description}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div> // 【核心修復】: 將結尾錯誤的 </nav> 標籤修正為正確的 </div>
  );
};

export default AdminNav;
