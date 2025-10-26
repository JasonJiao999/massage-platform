// 文件路徑: app/admin/users/page.tsx

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

  // 只有當提供了搜索關鍵字和篩選條件時，才執行查詢
  if (query && filter) {
    let queryBuilder = supabase.from('profiles').select('*');

    if (filter === 'nickname') {
      queryBuilder = queryBuilder.ilike('nickname', `%${query}%`);
    } else if (filter === 'email') {
      // 假設 email 存儲在 profiles 表
      queryBuilder = queryBuilder.ilike('email', `%${query}%`);
    }
    
    const { data } = await queryBuilder;
    users = data || [];
  }

  return <UsersListClient initialUsers={users} />;
}