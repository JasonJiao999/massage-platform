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
    <div className="p-4 md:p-6 lg:p-8 text-white">
      <h1 className="text-3xl font-bold mb-2">商户仪表盘</h1>
      <p className="mb-6 text-gray-400">欢迎回来, {shop.name}！</p>
      
      {/* 统计卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard 
          title="今日团队预约" 
          value={stats.today_team_bookings_count}
          icon={<FaCalendarDay className="text-blue-500" />} 
        />
        <StatCard 
          title="明日团队预约" 
          value={stats.tomorrow_team_bookings_count}
          icon={<FaRegCalendarAlt className="text-blue-500" />}
        />
        <StatCard 
          title="今日团队收入" 
          value={formatCurrency(stats.today_team_revenue)}
          icon={<FaDollarSign className="text-green-500" />}
        />
        <StatCard 
          title="本月团队收入" 
          value={formatCurrency(stats.this_month_team_revenue)}
          icon={<FaRegChartBar className="text-green-500" />}
        />
        <StatCard 
          title="本月完成预约" 
          value={stats.this_month_completed_bookings}
          icon={<FaCalendarCheck className="text-purple-500" />}
        />
         <StatCard 
          title="本月取消预约" 
          value={stats.this_month_cancelled_bookings}
          icon={<FaBan className="text-red-500" />}
        />
        <StatCard 
          title="团队人数" 
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
            <h1 className="text-2xl font-bold mb-4">欢迎, 商户!</h1>
            <p>您还没有创建店铺。</p>
            <Link href="/dashboard/shop" className="text-blue-500 hover:underline mt-2 inline-block">
              立即创建并设置您的店铺
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
        return <p className="p-6 text-red-500">加载仪表盘数据时出错，请稍后重试。</p>;
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