// src/app/staff-dashboard/services/page.tsx (最终完整版)

import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import StaffServicesClient from './StaffServicesClient'; // 1. 导入“厨师” (客户端组件)
import { type Service } from './StaffServicesClient';   // 2. 导入“食材清单”的类型定义

// 这是一个异步的服务器组件
export default async function StaffServicesPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 验证用户身份
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 【核心任务】: 从数据库获取当前用户拥有的所有服务
  // 我们不需要在这里进行任何复杂的过滤，因为 RLS 安全策略会自动处理
const { data: services, error } = await supabase
    .from('services')
    .select('*') 
    .eq('owner_id', user.id) // 确保用户权限
    .eq('is_active', true) // <-- 【关键修复】: 仅获取活跃的服务
    .order('created_at', { ascending: false });
  
  // 如果在获取数据时发生数据库层面的错误
  if (error) {
    console.error("获取服务数据时出错:", error.message);
    // 即使出错，也渲染客户端组件并传递一个空数组，防止整个页面崩溃
    return <StaffServicesClient services={[]} />;
  }
  
  // 确保如果 services 为 null (例如用户还没有任何服务)，我们传递的是一个空数组，而不是 null
  const servicesData: Service[] = services || [];

  // 【最终交付】: 将获取到的数据作为 props 传递给客户端组件进行渲染
  return <StaffServicesClient services={servicesData} />;
}