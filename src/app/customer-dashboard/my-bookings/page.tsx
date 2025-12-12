// src/app/my-bookings/page.tsx (已修复版)
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MyBookingsClient from './MyBookingsClient';
import { unstable_noStore as noStore } from 'next/cache';

export default async function MyBookingsPage() {
  noStore();
  
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  // 【核心修复】: 在关联查询 profiles 表时，明确指定使用哪个外键关系
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id,
      start_time,
      end_time,
      status,
      price_at_booking,
      services (
        name,
        duration_value,
        duration_unit
      ),
      worker:profiles!bookings_worker_profile_id_fkey (
        nickname,
        qr_url
      ),
      shops (
        name,
        slug
      )
    `)
    .eq('customer_id', user.id)
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Error fetching bookings:', error);
    return <p className="p-8 text-red-500">An error occurred while loading appointment information. Please try again later.</p>;
  }

  const transformedBookings = bookings.map(booking => ({
    ...booking,
    services: Array.isArray(booking.services) ? booking.services[0] || null : booking.services,
    worker: Array.isArray(booking.worker) ? booking.worker[0] || null : booking.worker,
    shops: Array.isArray(booking.shops) ? booking.shops[0] || null : booking.shops,
  }));

  return <MyBookingsClient bookings={transformedBookings || []} />;
}