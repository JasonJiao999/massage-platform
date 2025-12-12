// src/app/dashboard/page.tsx (已修復類型錯誤)

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import StatCard from '@/components/StatCard';
import { FaCalendarCheck, FaCalendarDay, FaDollarSign, FaBan, FaRegChartBar, FaRegCalendarAlt, FaUsers } from 'react-icons/fa';

// 【修復 1】: 從 DashboardClient 導入 MerchantDashboardStats
import DashboardClient, { MerchantDashboardStats } from '@/app/dashboard/DashboardClient'; 

// 【修復 2.A】: 移除 staff-dashboard 的 Profile 導入
// import { type Profile } from '@/app/staff-dashboard/DashboardClient'; // <-- 已移除

// 【修復 2.B】: 在本地定義正確的 Profile 類型，使其包含 'role'
type Profile = {
  id: string;
  role: string | null; // <-- 確保 'role' 字段存在
  points: number | null;
  referral_code: string | null;
  level: string | null; 
} | null; // 允許為 null

// 【修復 1.B】: 刪除本地重複的 MerchantDashboardStats 類型定義
/*
type MerchantDashboardStats = {
  ...
};
*/

// 主页面 - 负责数据获取和逻辑判断
export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // (此查詢現在會正確匹配我們在上面定義的本地 Profile 類型)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, points, referral_code, level') 
    .eq('id', user.id)
    .single<Profile>(); 

  // (此處 profile?.role 現在是有效的)
  const userRole = profile?.role;

  switch (userRole) {
    case 'customer':
      redirect('/dashboard/profile');
    
    case 'staff':
    case 'freeman':
      redirect('/staff-dashboard');
      
    case 'admin':
      redirect('/admin/shops');

    case 'merchant':
      const { data: shop } = await supabase
        .from('shops')
        .select('name, slug') 
        .eq('owner_id', user.id)
        .single();
      
      if (!shop) {
        // 如果商户还没有店铺，显示创建店铺的提示
        return (
          <div className="p-8 text-white">
            <h1 className="text-2xl font-bold mb-4">Welcome, merchants!</h1>
            <p>You have not created a team yet.。</p>
            <Link href="/dashboard/shop" className="text-blue-500 hover:underline mt-2 inline-block">
              Create and set up your team now.
            </Link>
          </div>
        );
      }

      // 调用 RPC 函数获取商户的统计数据
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_merchant_dashboard_stats', { p_owner_id: user.id })
        .single<MerchantDashboardStats>();

      if (statsError) {
        console.error('Error fetching merchant dashboard stats:', statsError);
        return <p className="p-6 text-red-500">An error occurred while loading data. Please try again later.</p>;
      }
      
      // (使用導入的 MerchantDashboardStats 類型)
      const defaultStats: MerchantDashboardStats = {
        today_team_bookings_count: 0,
        tomorrow_team_bookings_count: 0,
        today_team_revenue: 0,
        this_month_team_revenue: 0,
        this_month_completed_bookings: 0,
        this_month_cancelled_bookings: 0,
        team_member_count: 0,
      };

      const stats = statsData || defaultStats;
      
      // 渲染商户仪表盘
      return (
         <div className="max-w-[1200px] mx-auto gap-[10px]">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="mb-6 text-gray-400">Welcome back, {shop.name}！</p>
          <DashboardClient 
            stats={stats} 
            profile={profile} // <-- 傳遞 profile
            shopSlug={shop.slug}  // <-- 傳遞 shopSlug
          />
        </div>
      );

    default:
      // 如果角色未知或不存在，重定向到登录页
      return redirect('/login');
  }
}