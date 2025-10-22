// src/app/staff-dashboard/page.tsx (最终修复版 - 增加显式类型断言)

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import DashboardClient, { DashboardStats } from '@/app/staff-dashboard/DashboardClient'; 

export default async function StaffDashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <p className="p-6 text-red-500">需要登录才能查看仪表盘。</p>;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();
  
  if (profileError || !profile) {
    return <p className="p-6 text-red-500">无法找到您的工作档案。</p>;
  }

  // 【核心修复】: 在这里，我们明确地告诉 TypeScript statsData 的类型是 DashboardStats | null
  const { data: statsData, error: statsError } = await supabase
    .rpc('get_dashboard_stats', { p_worker_profile_id: profile.id })
    .single<DashboardStats>(); // <-- 在 .single() 中加入 <DashboardStats>

  if (statsError) {
    console.error('Error fetching dashboard stats:', statsError);
    return <p className="p-6 text-red-500">加载仪表盘数据时出错，请稍后重试。</p>;
  }
  
  const defaultStats: DashboardStats = {
    today_bookings_count: 0,
    tomorrow_bookings_count: 0,
    today_revenue: 0,
    this_month_revenue: 0,
    completed_bookings_count: 0,
    cancelled_by_customer_count: 0,
  };

  const stats = statsData || defaultStats;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-white">我的仪表盘</h1>
      <DashboardClient stats={stats} />
    </div>
  );
}