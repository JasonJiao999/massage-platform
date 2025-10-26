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
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 transition-transform hover:scale-105">
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className="text-white text-2xl" />
    </div>
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
    { title: '商戶員工數量', value: data.staffCount, icon: FaBriefcase, color: 'bg-indigo-500' },
    { title: '自由工作者數量', value: data.freelancerCount, icon: FaUserTie, color: 'bg-purple-500' },
    { title: '一般用戶數量', value: data.customerCount, icon: FaUserCheck, color: 'bg-teal-500' },
    { title: '本月已完成預約', value: data.completedBookingsThisMonth, icon: FaCalendarCheck, color: 'bg-orange-500' },
  ];

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">管理員儀表盤</h1>
        <p className="text-gray-600 mt-1">歡迎回來！以下是平台的關鍵數據概覽。</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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