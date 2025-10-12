// src/components/Header.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// 1. 导入我们创建的所有独立的 Header 组件
import HeaderAdmin from './HeaderAdmin';
import HeaderMerchant from './HeaderMerchant';
import HeaderStaff from './HeaderStaff';
import HeaderCustomer from './HeaderCustomer';

export default async function Header() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 2. 获取当前登录用户
  const { data: { user } } = await supabase.auth.getUser();
  
  let role = 'customer'; // 默认角色为 'customer' (适用于未登录的访客)

  // 3. 如果用户已登录，则查询他/她的真实角色
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    // 如果能找到 profile 并且有 role，就使用它
    if (profile && profile.role) {
      role = profile.role;
    }
  }

  // 4. 【核心逻辑】根据角色，渲染对应的 Header 组件
  switch (role) {
    case 'admin':
      return <HeaderAdmin user={user} />;
    case 'merchant':
      return <HeaderMerchant user={user} />;
    case 'staff':
      return <HeaderStaff user={user} />;
    default:
      // 'customer' 或任何其他未知角色都显示顾客/访客的导航栏
      return <HeaderCustomer user={user} />;
  }
}