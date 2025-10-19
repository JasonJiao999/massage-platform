// src/components/HeaderCustomer.tsx
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import Image from 'next/image';

export default function HeaderCustomer({ profile = {} }: { profile: any }) {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">

        <nav className="flex items-center space-x-4">
          <Link href="/" className="hover:text-gray-300">
            首页
          </Link>
          <Link href="/my-bookings" className="hover:text-gray-300">
            我的预约
          </Link>
          <Link href="/dashboard/profile" className="hover:text-gray-300">
            我的信息
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full overflow-hidden relative">
              <Image
                // 【核心修改】: 始终使用默认头像
                src={'/default-avatar.png'}
                alt="user avatar"
                fill
                className="object-cover"
              />
            </div>
            <span>{profile.nickname || profile.full_name || '用户'}</span>
          </div>
          <LogoutButton logoutText="退出登录" />
        </nav>
      </div>
    </header>
  );
}