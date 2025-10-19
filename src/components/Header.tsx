// src/components/Header.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import HeaderAdmin from './HeaderAdmin';
import HeaderMerchant from './HeaderMerchant';
import HeaderStaff from './HeaderStaff';
import HeaderCustomer from './HeaderCustomer';

export default async function Header() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role, nickname, full_name, avatar_url')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  if (!user || !profile) {
    // 未登录或找不到 profile 时的通用导航栏
    return (
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          

        </div>
      </header>
    );
  }

  // 根据角色渲染不同的导航栏
  switch (profile.role) {
    case 'admin':
      // 【核心修复】: 传递 user 属性
      return <HeaderAdmin user={user} />;
    
    case 'merchant':
      // 【核心修复】: 为商户查询 shopSlug 并传递所需属性
      const { data: shop } = await supabase
        .from('shops')
        .select('slug')
        .eq('owner_id', user.id)
        .single();
      return <HeaderMerchant user={user} shopSlug={shop?.slug || null} />;
    
    case 'staff':
    case 'freeman':
      // 【核心修复】: 传递 user 属性
      return <HeaderStaff user={user} />;
    
    case 'customer':
      return <HeaderCustomer profile={profile} />;
      
    default:
      // 可以提供一个默认的导航栏或显示错误
      return <div>Unknown role</div>;
  }
}