// filename: src/app/dashboard/DashboardClient.tsx

'use client';

import StatCard from '@/components/StatCard';
import { FaCalendarCheck, FaCalendarDay, FaDollarSign, FaBan, FaRegChartBar, FaRegCalendarAlt, FaUsers } from 'react-icons/fa';

// 定义从服务器传来的商户统计数据类型
export type MerchantDashboardStats = {
  today_team_bookings_count: number;
  tomorrow_team_bookings_count: number;
  today_team_revenue: number;
  this_month_team_revenue: number;
  this_month_completed_bookings: number;
  this_month_cancelled_bookings: number;
  team_member_count: number;
};

export default function DashboardClient({ stats }: { stats: MerchantDashboardStats }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { 
      style: 'currency', 
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex flex-row flex-wrap justify-start gap-4 p-4">
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
  );
}