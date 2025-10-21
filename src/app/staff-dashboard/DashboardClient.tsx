// src/app/staff-dashboard/DashboardClient.tsx
'use client';

import StatCard from '@/components/StatCard';
// 建议安装 react-icons: pnpm install react-icons
import { FaCalendarCheck, FaCalendarDay, FaDollarSign, FaBan, FaRegChartBar, FaRegCalendarAlt } from 'react-icons/fa';

// 定义从服务器传来的数据类型
type DashboardStats = {
  today_bookings_count: number;
  tomorrow_bookings_count: number;
  today_revenue: number;
  this_month_revenue: number;
  completed_bookings_count: number;
  cancelled_by_customer_count: number;
};

export default function DashboardClient({ stats }: { stats: DashboardStats }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB' }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard 
        title="今日预约数" 
        value={stats.today_bookings_count}
        icon={<FaCalendarDay className="text-blue-500" />} 
      />
      <StatCard 
        title="明日预约数" 
        value={stats.tomorrow_bookings_count}
        icon={<FaRegCalendarAlt className="text-blue-500" />}
      />
      <StatCard 
        title="今日收入" 
        value={formatCurrency(stats.today_revenue)}
        icon={<FaDollarSign className="text-green-500" />}
      />
      <StatCard 
        title="本月收入" 
        value={formatCurrency(stats.this_month_revenue)}
        icon={<FaRegChartBar className="text-green-500" />}
      />
      <StatCard 
        title="已完成预约" 
        value={stats.completed_bookings_count}
        icon={<FaCalendarCheck className="text-purple-500" />}
      />
      <StatCard 
        title="客户取消" 
        value={stats.cancelled_by_customer_count}
        icon={<FaBan className="text-red-500" />}
      />
    </div>
  );
}