// src/app/staff-dashboard/bookings/page.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import BookingManagementClient from './BookingManagementClient';
import { Database } from '@/lib/database.types';

export default async function BookingManagementPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="text-foreground w-[1200px] mx-auto px-[24px] m-[10px]">
        <h1 className="text-3xl font-bold mx-[20px]">Appointment Management</h1>
        <div className="text-red-500">Please log in first.</div>
      </div>
    );
  }

  const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const filter = typeof searchParams.filter === 'string' ? searchParams.filter : 'all';

  try {
    // 【核心修改】将错误的列名 'user_id' 修改为正确的 'id'
    const { data: workerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id) // <--- 致命错误在这里，已经修正！
      .single();

    if (profileError || !workerProfile || !['freeman', 'staff'].includes(workerProfile.role as string)) {
      // 为了调试，我们暂时保留这个详细的错误日志
      console.error("Character verification failed details:", {
        profileError: profileError,
        workerProfile: workerProfile,
        role: workerProfile?.role
      });
      throw new Error('The current user is not a worker and cannot view appointments.');
    }

    let query = supabase
      .from('bookings')
      .select(`
        *,
        services(*),
        customer:profiles!bookings_customer_id_fkey(*)
      `)
      .eq('worker_profile_id', workerProfile.id)
      .range(offset, offset + limit - 1)
      .order('start_time', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }
    
    const { data: bookings, error, count } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      throw new Error('Loading failed');
    }

    return (
    <div className="text-foreground max-w-[1200px] mt-[10px]">



      <h2 className="text-xl font-bold text-white w-[full-20px] mx-[10px]">Appointment Management</h2>



        <BookingManagementClient
          bookings={bookings || []}
          totalCount={count || 0}
          currentPage={page}
          limit={limit}
        />
      </div>
    );
  } catch (error: any) {
    return (
      <div className="text-foreground max-w-[1200px] mt-[10px]">

      <h2 className="text-xl font-bold text-white w-[full-20px] mx-[10px]">Appointment Management</h2>


        <div className="text-red-500 bg-red-100 border border-red-400 rounded-md">
          <p>Loading failed: {error.message}</p>
        </div>
      </div>
    );
  }
}