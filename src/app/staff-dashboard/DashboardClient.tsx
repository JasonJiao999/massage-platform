// src/app/staff-dashboard/DashboardClient.tsx (已更新)
'use client';

import StatCard from '@/components/StatCard';
import { FaCalendarCheck, FaCalendarDay, FaDollarSign, FaBan, FaRegChartBar, FaRegCalendarAlt } from 'react-icons/fa';

// 类型定义保持不变，与数据库返回的真实字段完全一致
export type DashboardStats = {
  today_bookings_count: number;
  tomorrow_bookings_count: number;
  today_revenue: number;
  this_month_revenue: number;
  completed_bookings_count: number;
  cancelled_by_customer_count: number;
};

export default function DashboardClient({ stats }: { stats: DashboardStats }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { 
      style: 'currency', 
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 【核心修改 1】: 移除了不再需要的取消率计算逻辑
  // const totalBookings = stats.completed_bookings_count + stats.cancelled_by_customer_count;
  // const cancellation_rate = totalBookings > 0 
  //   ? (stats.cancelled_by_customer_count / totalBookings) * 100 
  //   : 0;

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
      {/* 【核心修改 2】: 更新卡片标题和值 */}
      <StatCard 
        title="已取消预约" 
        value={stats.cancelled_by_customer_count}
        icon={<FaBan className="text-red-500" />}
      />
    </div>
  );
}