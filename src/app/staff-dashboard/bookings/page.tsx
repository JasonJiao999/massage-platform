// src/app/staff-dashboard/bookings/page.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import BookingManagementClient from './BookingManagementClient';

export default async function StaffBookingsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  // 【核心修复】: 恢复完整的变量定义和数据获取逻辑
  const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const filter = typeof searchParams.filter === 'string' ? searchParams.filter : 'all';
  const limit = 10;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('bookings')
    .select(
      `
      *,
      services (name),
      customer:profiles (
        full_name,
        bio
      )
    `,
      { count: 'exact' }
    )
    .eq('worker_profile_id', user.id);

  if (filter !== 'all') {
    query = query.eq('status', filter);
  }

  const { data: bookings, error, count } = await query
    .order('start_time', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Error fetching bookings:', error);
    return <div>加载预约失败...</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-white mb-6">预约管理</h1>
      <BookingManagementClient
        bookings={bookings || []}
        totalCount={count || 0}
        currentPage={page}
        limit={limit}
      />
    </div>
  );
}