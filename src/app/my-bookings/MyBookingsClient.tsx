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
  worker: { nickname: string | null; avatar_url: string | null; } | null;
  shops: { name: string | null; slug: string | null; } | null;
};

// 【新增】取消按钮组件，用于处理 pending 状态
function CancelButton() {
    const { pending } = useFormStatus();
    return (
        <button 
            type="submit" 
            disabled={pending} 
            className="text-xs font-medium text-red-600 hover:underline disabled:text-gray-400 disabled:no-underline"
        >
            {pending ? '处理中...' : '取消预约'}
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
    if (unit === 'minutes') return '分钟';
    if (unit === 'hours') return '小时';
    return '';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border overflow-hidden ${isPast ? 'opacity-70' : ''}`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-800">{booking.services?.name || '未知服务'}</h3>
          <span className="text-lg font-semibold text-green-600">¥{booking.price_at_booking}</span>
        </div>
        
        <div className="space-y-3 text-sm text-gray-600">
          <p><strong>日期:</strong> {formatDate(startTime)}</p>
          <p><strong>时间:</strong> {formatTime(startTime)} - {formatTime(new Date(booking.end_time))}</p>
          <p><strong>时长:</strong> {booking.services?.duration_value} {translateUnit(booking.services?.duration_unit ?? null)}</p>
          <p><strong>状态:</strong> <span className="font-medium text-blue-600">{booking.status}</span></p>
        </div>

        <div className="border-t mt-4 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={booking.worker?.avatar_url || '/default-avatar.png'}
              alt={booking.worker?.nickname || '技师'}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-800">{booking.worker?.nickname || '未知技师'}</p>
              {booking.shops && (
                <Link href={`/shops/${booking.shops.slug}`} className="text-xs text-blue-500 hover:underline">
                  {booking.shops.name || '未知店铺'}
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
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">我的预约</h1>
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">未来的预约</h2>
          {upcomingBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}
            </div>
          ) : <p className="text-gray-500">您当前没有未来的预约。</p>}
        </section>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">历史预约</h2>
          {pastBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}
            </div>
          ) : <p className="text-gray-500">您还没有历史预约记录。</p>}
        </section>
      </div>
    </main>
  );
}