// src/app/staff-dashboard/DashboardClient.tsx (已更新)
'use client';

import StatCard from '@/components/StatCard';
import { 
  FaCalendarCheck, 
  FaCalendarDay, 
  FaDollarSign, 
  FaBan, 
  FaRegChartBar, 
  FaRegCalendarAlt,
  FaTrophy, // <-- 新增
  FaShareAlt,
  FaShieldAlt
} from 'react-icons/fa';
import React from 'react';



// 类型定义保持不变，与数据库返回的真实字段完全一致
export type DashboardStats = {
  today_bookings_count: number;
  tomorrow_bookings_count: number;
  today_revenue: number;
  this_month_revenue: number;
  completed_bookings_count: number;
  cancelled_by_customer_count: number;
};

// 类型 2: Profile (必须与 page.tsx 匹配)
export type Profile = {
  id: string; // <-- (新增)
  points: number | null;
  referral_code: string | null;
  level: string | null; // <-- 新增
} | null; // 允许为 null

// props 现在接收 stats 和 profile (修复 TS2322 错误)
export default function DashboardClient({ stats, profile }: { stats: DashboardStats, profile: Profile }) {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { 
      style: 'currency', 
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

return (
<div className="flex w-full min-[500px]:max-w-[500px] min-[1200px]:max-w-[1200px] justify-center">

  <div className="flex w-full flex-wrap text-[var(--foreground)] gap-[10px] mx-auto justify-evenly">
    <StatCard 
          title="Account Level (ระดับ)" 
          value={profile?.level ?? '1'} // 如果 level 为 null，默认显示 '1'
          icon={<FaShieldAlt className="text-[var(--foreground)]" />}
        />
    <StatCard 
          title="My Points (คะแนน)" 
          value={profile?.points ?? 0}
          icon={<FaTrophy className="text-[var(--foreground)]" />}
        />
    <StatCard 
          title="Referral Code (รหัสอ้างอิง)" 
          value={profile?.referral_code ?? 'N/A'}
          icon={<FaShareAlt className="text-[var(--foreground)]" />}
        />
    <StatCard 
      title="นัดวันนี้" 
      value={stats.today_bookings_count}
      icon={<FaCalendarDay className="text-[var(--foreground)]" />} 
    />
    <StatCard 
      title="การจองพรุ่งนี้" 
      value={stats.tomorrow_bookings_count}
      icon={<FaRegCalendarAlt className="text-[var(--foreground)]" />}
    />
    <StatCard 
      title="รายได้วันนี้" 
      value={formatCurrency(stats.today_revenue)}
      icon={<FaDollarSign className="text-[var(--foreground)]" />}
    />
    <StatCard 
      title="รายได้เดือนนี้" 
      value={formatCurrency(stats.this_month_revenue)}
      icon={<FaRegChartBar className="text-[var(--foreground)]" />}
    />
    <StatCard 
      title="นัดหมายเสร็จสิ้น" 
      value={stats.completed_bookings_count}
      icon={<FaCalendarCheck className="text-[var(--foreground)]" />}
    />
    <StatCard 
      title="ยกเลิกการนัดหมาย" 
      value={stats.cancelled_by_customer_count}
      icon={<FaBan className="text-[var(--foreground)]" />}
    />
    
 

  </div>



  </div>




);
}