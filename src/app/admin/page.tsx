// 文件路徑: app/admin/page.tsx (已修正統計邏輯)

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { startOfMonth, endOfMonth } from 'date-fns';
import SuperAdminDashboardClient from '@/app/admin/SuperAdminDashboardClient';

// (接口定義 DashboardData 保持不變)
export interface DashboardData {
  totalUsers: number;
  shopCount: number;
  staffCount: number;
  freelancerCount: number;
  customerCount: number;
  completedBookingsThisMonth: number;
}

export default async function AdminPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. 驗證用戶身份 (邏輯保持不變)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 font-bold">權限不足，只有超級管理員才能訪問此頁面。</p>
      </div>
    );
  }

  // 2. 【核心修復】: 根據您提供的 role 定義，重構所有統計查詢
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const [
    { count: totalUsers },
    { count: shopCount },      // 商戶 (merchant)
    { count: staffCount },     // 員工 (staff)
    { count: freelancerCount },// 自由工作者 (freeman)
    { count: customerCount },  // 一般用戶 (customer)
    { count: completedBookingsThisMonth }
  ] = await Promise.all([
    // 總用戶數：查詢 profiles 表總數
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    
    // 商戶數：查詢 role 為 'merchant' 的用戶
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'merchant'),
    
    // 員工數：查詢 role 為 'staff' 的用戶
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'staff'),
    
    // 自由工作者數：查詢 role 為 'freeman' 的用戶
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'freeman'),

    // 一般用戶數：查詢 role 為 'customer' 的用戶
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    
    // 本月已完成預約數 (邏輯保持不變)
    supabase.from('schedules').select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('start_time', monthStart.toISOString())
      .lte('start_time', monthEnd.toISOString())
  ]);
  
  // 3. 整理數據 (現在無需複雜計算)
  const dashboardData: DashboardData = {
    totalUsers: totalUsers || 0,
    shopCount: shopCount || 0,
    staffCount: staffCount || 0,
    freelancerCount: freelancerCount || 0,
    customerCount: customerCount || 0,
    completedBookingsThisMonth: completedBookingsThisMonth || 0,
  };

  // 4. 將正確的數據傳遞給前端組件
  return <SuperAdminDashboardClient data={dashboardData} />;
}