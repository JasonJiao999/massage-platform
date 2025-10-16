// src/app/staff-dashboard/layout.tsx (简化版 - 只负责安全)

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default async function StaffDashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // 【核心修改】: 这里不再渲染 Header，只做权限检查
  // 如果当前用户不是 'staff' 或 'freeman'，则不允许访问，直接重定向到首页
  if (!['staff', 'freeman'].includes(profile?.role)) {
    redirect('/');
  }

  // 如果权限检查通过，则直接渲染子页面内容
  return <>{children}</>;
}