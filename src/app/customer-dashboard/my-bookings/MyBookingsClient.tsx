// src/app/my-bookings/MyBookingsClient.tsx (最终版 - 带取消功能)
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { cancelBooking } from '@/lib/actions';

// 定义从服务器传入的 booking 对象类型 (保持不变)
type Booking = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  price_at_booking: number;
  services: { name: string | null; duration_value: number | null; duration_unit: string | null; } | null;
  worker: { nickname: string | null; qr_url: string | null; } | null;
  shops: { name: string | null; slug: string | null; } | null;
};

// 【新增】取消按钮组件，用于处理 pending 状态
function CancelButton() {
    const { pending } = useFormStatus();
    return (
        <button 
            type="submit" 
            disabled={pending} 
            className="btn"
        >
            {pending ? 'Processing...' : 'Cancel'}
        </button>
    );
}

// 预约卡片组件
function BookingCard({ booking }: { booking: Booking }) {
  const [state, formAction] = useFormState(cancelBooking, { success: false, message: '' });
  const startTime = new Date(booking.start_time);
  const isPast = startTime < new Date();

  const formatDate = (date: Date) => date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (date: Date) => date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  const translateUnit = (unit: string | null) => {
    if (unit === 'minutes') return 'minutes';
    if (unit === 'hours') return 'hours';
    return '';
  };

  return (
    <div className={`rounded-lg  overflow-hidden ${isPast ? 'opacity-70' : ''}`}>
      <div className="card bg-[var(--color-third)] p-[10px] text-[var(--color-secondary)] min-w-[130px] max-[11000px]:w-[350px] h-[400px] ">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold">{booking.services?.name || 'Unknown'}</h3>

        </div>
        
        <div className="space-y-3 text-sm">
          <p><strong>Fee:</strong>{booking.price_at_booking} THB</p>
          <p><strong>Date:</strong> {formatDate(startTime)}</p>
          <p><strong>Time:</strong> {formatTime(startTime)} - {formatTime(new Date(booking.end_time))}</p>
          <p><strong>Duration:</strong> {booking.services?.duration_value} {translateUnit(booking.services?.duration_unit ?? null)}</p>
          <p><strong>State:</strong> <span className="font-medium ">{booking.status}</span></p>
          <p><strong>Worker:</strong>{booking.worker?.nickname || 'Unknown worker'}</p>

        </div>

        <div className="border-t  flex items-center justify-between">
          <div className="flex items-center gap-3">
 
            <div className='my-[15px]'>
              Team:
            {booking.shops && (
                <Link href={`/shops/${booking.shops.slug}`} className="">
                  {booking.shops.name || 'Unknown team'}
                </Link>
              )}
            </div>
          </div>
          
          {/* 【核心修改】: 添加取消按钮的表单 */}
          {/* 只在“未来的”、“已确认”的预约上显示取消按钮 */}
          {!isPast && booking.status === 'confirmed' && (
            <form action={formAction.bind(null, booking.id)}>
              <CancelButton />
            </form>
          )}
        </div>
        {/* 显示 Server Action 返回的消息 */}
        {state.message && (
            <p className={`mt-2 text-xs font-semibold ${state.success ? 'text-green-600' : 'text-red-500'}`}>{state.message}</p>
        )}
      </div>
    </div>
  );
}

// 主客户端组件 (保持不变)
export default function MyBookingsClient({ bookings }: { bookings: Booking[] }) {
  const { upcomingBookings, pastBookings } = useMemo(() => {
    const now = new Date();
    const upcoming: Booking[] = [];
    const past: Booking[] = [];
    bookings.forEach(booking => {
      new Date(booking.start_time) >= now ? upcoming.push(booking) : past.push(booking);
    });
    upcoming.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    return { upcomingBookings: upcoming, pastBookings: past };
  }, [bookings]);

  return (
   
      <div className="flex-1max-w-[1180px] mx-[10px]">
        <h1 className="text-3xl md:text-4xl font-bold  ">My Booking</h1>
        <h2 className="card bg-primary text-[var(--foreground)] p-[24px]">Future Bookings</h2>
<section className="my-[10px] w-full flex justify-center">
  <div className='mx-auto'>
    {upcomingBookings.length > 0 ? (
 
      <div className="grid grid-cols-2 min-[800px]:grid-cols-3  justify-start gap-[10px]">
        {upcomingBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}
      </div>
    ) : (
      <p className="font-semibold p-[24px]">You currently have no future bookings.</p>
    )}
  </div>
</section>

        <h2 className="card bg-primary text-[var(--foreground)] p-[24px] ">Record</h2>
        <section className="flex justify-center w-full">
          <div className=' mx-auto'>

          {pastBookings.length > 0 ? (
            <div className="grid grid-cols-2 min-[800px]:grid-cols-3 justify-start gap-[10px]">
              {pastBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}
            </div>
          ) : <p className="font-semibold p-[24px]">You have not recorded anything.</p>}
          </div>
        </section>
      </div>

  );
}