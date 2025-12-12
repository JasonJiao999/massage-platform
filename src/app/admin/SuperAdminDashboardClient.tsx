// 文件路徑: app/admin/SuperAdminDashboardClient.tsx (已更新)

'use client';

import { FC } from 'react';
import { 
  FaUsers, 
  FaStore, 
  FaBriefcase, 
  FaUserTie, 
  FaUserCheck, 
  FaCalendarCheck 
} from 'react-icons/fa';
import { DashboardData } from './page'; // 相對路徑，無需更改

// 可重用的卡片組件
const StatCard: FC<{ icon: React.ElementType; title: string; value: number; color: string; }> = ({ icon: Icon, title, value, color }) => (
  <div className="card bg-[var(--color-third)] w-[300px] text-center mx-auto my-[20px]">

    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

// 主顯示組件
const SuperAdminDashboardClient: FC<{ data: DashboardData }> = ({ data }) => {
  const stats = [
    { title: '網站註冊用戶總數', value: data.totalUsers, icon: FaUsers, color: 'bg-blue-500' },
    { title: '商戶賬號數量', value: data.shopCount, icon: FaStore, color: 'bg-green-500' },
    { title: '隶属商戶人员數量', value: data.staffCount, icon: FaBriefcase, color: 'bg-indigo-500' },
    { title: '自由工作者數量', value: data.freelancerCount, icon: FaUserTie, color: 'bg-purple-500' },
    { title: '一般用戶數量', value: data.customerCount, icon: FaUserCheck, color: 'bg-teal-500' },
    { title: '本月已完成預約', value: data.completedBookingsThisMonth, icon: FaCalendarCheck, color: 'bg-orange-500' },
  ];

  return (
    <div className="max-w-[1150px] mx-auto gap-4r p-[24px] my-[10px]">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">管理員儀表盤</h1>

      </header>
      
      <div className="flex flex-row flex-wrap justify-start">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>
    </div>
  );
};

export default SuperAdminDashboardClient;