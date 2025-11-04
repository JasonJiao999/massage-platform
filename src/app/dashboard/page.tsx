// src/app/dashboard/page.tsx (已更新)

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import StatCard from '@/components/StatCard';
import { FaCalendarCheck, FaCalendarDay, FaDollarSign, FaBan, FaRegChartBar, FaRegCalendarAlt, FaUsers } from 'react-icons/fa';

// 定义从服务器传来的商户统计数据类型
type MerchantDashboardStats = {
  today_team_bookings_count: number;
  tomorrow_team_bookings_count: number;
  today_team_revenue: number;
  this_month_team_revenue: number;
  this_month_completed_bookings: number;
  this_month_cancelled_bookings: number;
  team_member_count: number;
};

// 这是一个专门为商户展示的仪表盘组件
function MerchantDashboard({ shop, stats }: { shop: { name: string }, stats: MerchantDashboardStats }) {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { 
      style: 'currency', 
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="max-w-[1200px] mx-auto gap-[10px]">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="mb-6 text-gray-400">Welcome back, {shop.name}！</p>
      
      {/* 统计卡片网格 */}
    <div className="flex flex-row flex-wrap justify-start gap-4 p-4 mx-auto">
      <StatCard 
        title="Today's team booking" 
        value={stats.today_team_bookings_count}
        icon={<FaCalendarDay className="text-blue-500" />} 
      />
      <StatCard 
        title="Tomorrow's team bookings" 
        value={stats.tomorrow_team_bookings_count}
        icon={<FaRegCalendarAlt className="text-blue-500" />}
      />
      <StatCard 
        title="Today's team income" 
        value={formatCurrency(stats.today_team_revenue)}
        icon={<FaDollarSign className="text-green-500" />}
      />
      <StatCard 
        title="Team income this month" 
        value={formatCurrency(stats.this_month_team_revenue)}
        icon={<FaRegChartBar className="text-green-500" />}
      />
      <StatCard 
        title="Complete appointments this month" 
        value={stats.this_month_completed_bookings}
        icon={<FaCalendarCheck className="text-purple-500" />}
      />
       <StatCard 
        title="Cancel appointments this month" 
        value={stats.this_month_cancelled_bookings}
        icon={<FaBan className="text-red-500" />}
      />
      <StatCard 
        title="Team size" 
        value={stats.team_member_count}
        icon={<FaUsers className="text-yellow-500" />}
      />
    </div>
    </div>
  );
}

// 主页面 - 负责数据获取和逻辑判断
export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

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
      const { data: shop } = await supabase.from('shops').select('name').eq('owner_id', user.id).single();
      
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
      return <MerchantDashboard shop={shop} stats={stats} />;

    default:
      // 如果角色未知或不存在，重定向到登录页
      return redirect('/login');
  }
}