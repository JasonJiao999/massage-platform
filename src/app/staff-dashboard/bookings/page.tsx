// src/app/staff-dashboard/bookings/page.tsx (已修复版)
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import BookingManagementClient from './BookingManagementClient';

const PAGE_SIZE = 5; // 每页显示10条记录

export default async function StaffBookingsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  noStore();

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }
  
  const activePage = parseInt(searchParams?.activePage as string, 10) || 1;
  const pastPage = parseInt(searchParams?.pastPage as string, 10) || 1;

  const activeFrom = (activePage - 1) * PAGE_SIZE;
  const activeTo = activeFrom + PAGE_SIZE - 1;
  const pastFrom = (pastPage - 1) * PAGE_SIZE;
  const pastTo = pastFrom + PAGE_SIZE - 1;

  // --- 查询活动预约 (分页) ---
  const { data: activeBookings, error: activeError, count: activeCount } = await supabase
    .from('bookings')
    .select(`
      id, start_time, end_time, status,
      services (name),
      customer:profiles!bookings_customer_id_fkey (nickname, email)
    `, { count: 'exact' })
    .eq('worker_profile_id', user.id)
    // 【核心修复】: 将 .not.in(...) 修改为正确的 Supabase 语法
    .not('status', 'in', '("completed","cancelled_by_customer","cancelled_by_worker","no_show")')
    .order('start_time', { ascending: true })
    .range(activeFrom, activeTo);
    
  // --- 查询历史预约 (分页) ---
  const { data: pastBookings, error: pastError, count: pastCount } = await supabase
    .from('bookings')
    .select(`
      id, start_time, end_time, status,
      services (name),
      customer:profiles!bookings_customer_id_fkey (nickname, email)
    `, { count: 'exact' })
    .eq('worker_profile_id', user.id)
    .in('status', ['completed', 'cancelled_by_customer', 'cancelled_by_worker', 'no_show'])
    .order('start_time', { ascending: false })
    .range(pastFrom, pastTo);

  if (activeError || pastError) {
    console.error('Error fetching paginated bookings:', activeError || pastError);
    return <p className="p-8 text-red-500">加载预约列表时出错。</p>;
  }

  const totalActivePages = Math.ceil((activeCount || 0) / PAGE_SIZE);
  const totalPastPages = Math.ceil((pastCount || 0) / PAGE_SIZE);

  const transformedActive = (activeBookings || []).map(b => ({ ...b, services: Array.isArray(b.services) ? b.services[0] : b.services, customer: Array.isArray(b.customer) ? b.customer[0] : b.customer }));
  const transformedPast = (pastBookings || []).map(b => ({ ...b, services: Array.isArray(b.services) ? b.services[0] : b.services, customer: Array.isArray(b.customer) ? b.customer[0] : b.customer }));

  return (
    <BookingManagementClient
      activeBookings={transformedActive}
      pastBookings={transformedPast}
      activePage={activePage}
      totalActivePages={totalActivePages}
      pastPage={pastPage}
      totalPastPages={totalPastPages}
    />
  );
}