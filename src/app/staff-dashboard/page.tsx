// src/app/staff-dashboard/page.tsx (最终修复版 - 增加显式类型断言)

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import DashboardClient, { DashboardStats } from '@/app/staff-dashboard/DashboardClient'; 

export default async function StaffDashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <p className="p-6 text-red-500">You need to be logged in to view the dashboard.</p>;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();
  
  if (profileError || !profile) {
    return <p className="p-6 text-red-500">Your profile cannot be found.</p>;
  }


  const { data: statsData, error: statsError } = await supabase
    .rpc('get_dashboard_stats', { p_worker_profile_id: profile.id })
    .single<DashboardStats>(); 

  if (statsError) {
    console.error('Error fetching dashboard stats:', statsError);
    return <p className="p-6 text-red-500">An error occurred while loading dashboard data. Please try again later.</p>;
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
    <div className="max-w-[1200px] mx-auto gap-[10px]">
      <h1 className="text-3xl font-bold mb-6 text-white">Dashboard</h1>
      <DashboardClient stats={stats} />
    </div>
  );
}