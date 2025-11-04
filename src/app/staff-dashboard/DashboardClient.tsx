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

// DashboardClient.tsx
return (
  <div className="flex flex-row flex-wrap justify-start text-[var(--foreground)]">
    <StatCard 
      title="Number of orders today" 
      value={stats.today_bookings_count}
      icon={<FaCalendarDay className="text-[var(--foreground)]" />} 
    />
    <StatCard 
      title="Tomorrow's orders" 
      value={stats.tomorrow_bookings_count}
      icon={<FaRegCalendarAlt className="text-[var(--foreground)]" />}
    />
    <StatCard 
      title="Today's income" 
      value={formatCurrency(stats.today_revenue)}
      icon={<FaDollarSign className="text-[var(--foreground)]" />}
    />
    <StatCard 
      title="Monthly income" 
      value={formatCurrency(stats.this_month_revenue)}
      icon={<FaRegChartBar className="text-[var(--foreground)]" />}
    />
    <StatCard 
      title="Completed orders" 
      value={stats.completed_bookings_count}
      icon={<FaCalendarCheck className="text-[var(--foreground)]" />}
    />
    <StatCard 
      title="Cancelled orders" 
      value={stats.cancelled_by_customer_count}
      icon={<FaBan className="text-[var(--foreground)]" />}
    />
  </div>
);
}