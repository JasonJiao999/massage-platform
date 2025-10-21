// src/app/staff-dashboard/page.tsx (最终版)

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import DashboardClient from '@/app/staff-dashboard/DashboardClient'; // 导入我们创建的客户端组件

export default async function StaffDashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. 获取当前登录的用户信息
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <p className="p-6 text-red-500">需要登录才能查看仪表盘。</p>;
  }

  // 2. 根据 user.id 找到对应的 profile (技师/商户自己)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id) // 假设 profiles 表的 id 就是 user.id
    .single();
  
  if (profileError || !profile) {
    return <p className="p-6 text-red-500">无法找到您的工作档案。</p>;
  }

  // 3. 调用我们创建的 RPC 函数来获取所有统计数据
  const { data: stats, error: statsError } = await supabase
    .rpc('get_dashboard_stats', { p_worker_profile_id: profile.id })
    .single(); // 因为函数只返回一行，所以使用 .single()

  if (statsError) {
    console.error('Error fetching dashboard stats:', statsError);
    return <p className="p-6 text-red-500">加载仪表盘数据失败。</p>;
  }

  // 4. 渲染页面，将数据传递给客户端组件
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">仪表盘</h1>
      
      {stats ? (
        <DashboardClient stats={stats} />
      ) : (
        <p className="text-gray-500">暂无数据可显示。</p>
      )}
    </div>
  );
}