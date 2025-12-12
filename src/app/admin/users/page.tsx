// 文件路徑: app/admin/users/page.tsx (已更新默認查詢邏輯)

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import UsersListClient from './UsersListClient';

interface SearchParams {
  query?: string;
  filter?: 'nickname' | 'email';
}

export default async function UsersPage({ searchParams }: { searchParams: SearchParams }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { query, filter } = searchParams;
  let users = [];

  // 我們從 'profiles' 表開始查詢
  let queryBuilder = supabase
    .from('profiles')
    .select('*, subscription_status, subscription_expires_at'); // (保持 select 不變)

  if (query && filter) {
    // --- 方案 A：用戶正在執行搜索 ---
    // (RLS 策略已修復，現在搜索將返回所有用戶)
    if (filter === 'nickname') {
      queryBuilder = queryBuilder.ilike('nickname', `%${query}%`);
    } else if (filter === 'email') {
      queryBuilder = queryBuilder.ilike('email', `%${query}%`);
    }
    
    const { data } = await queryBuilder;
    users = data || [];

  } else {
    // --- 方案 B (*** 核心修改 ***)：用戶沒有搜索 (默認視圖) ---
    // 按照您的需求，默認顯示需要續費的工作者
    
    const { data } = await queryBuilder
      // 1. 只看工作者
      .in('role', ['freeman', 'staff']) 
      // 2. 篩選出狀態不是 'active' 或 (OR) 已經過期的
      .or('subscription_status.neq.active,subscription_expires_at.lte.now()')
      // 3. 按即將到期/已到期排序，最早到期的在最前面
      .order('subscription_expires_at', { ascending: true, nullsFirst: true }) 
      .limit(20); // (默認最多顯示 20 個)
      
    users = data || [];
  }

  return <UsersListClient initialUsers={users} />;
}