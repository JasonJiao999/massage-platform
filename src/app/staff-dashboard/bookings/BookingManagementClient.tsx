// src/app/staff-dashboard/bookings/BookingManagementClient.tsx (已更新为分页版本)
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { cancelBooking, startService, completeService } from '@/lib/actions';
import PaginationControls from './PaginationControls'; // 导入新的分页组件

// 类型定义 (保持不变)
type Booking = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  services: { name: string | null } | null;
  customer: { nickname: string | null; email: string | null } | null;
};

// ActionButton 和 BookingCard 组件 (保持不变)
function ActionButton({ text, pendingText, className }: { text: string; pendingText: string; className: string; }) {
    const { pending } = useFormStatus();
    return <button type="submit" disabled={pending} className={`px-3 py-1 text-xs font-semibold rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}>{pending ? pendingText : text}</button>;
}

function BookingCard({ booking }: { booking: Booking }) {
  const [cancelState, cancelAction] = useFormState(cancelBooking, { success: false, message: '' });
  const startTime = new Date(booking.start_time);
  
  const formatDate = (date: Date) => date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
  const formatTime = (date: Date) => date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-lg shadow-md border p-4 space-y-3">
      <div>
        <p className="font-bold text-gray-800">{booking.services?.name || '未知服务'}</p>
        <p className="text-sm text-gray-600">顾客: {booking.customer?.nickname || booking.customer?.email || '未知顾客'}</p>
      </div>
      <div className="text-sm">
        <p><strong>日期:</strong> {formatDate(startTime)}</p>
        <p><strong>时间:</strong> {formatTime(startTime)} - {formatTime(new Date(booking.end_time))}</p>
        <p><strong>状态:</strong> <span className="font-medium text-blue-600">{booking.status}</span></p>
      </div>
      <div className="flex items-center gap-2 pt-2 border-t">
        {booking.status === 'confirmed' && (
          <>
            <form action={startService.bind(null, booking.id)}><ActionButton text="开始服务" pendingText="处理中..." className="bg-green-500 text-white hover:bg-green-600" /></form>
            <form action={cancelAction.bind(null, booking.id)}><ActionButton text="取消" pendingText="取消中..." className="bg-red-500 text-white hover:bg-red-600" /></form>
          </>
        )}
        {booking.status === 'in_progress' && (
          <form action={completeService.bind(null, booking.id)}><ActionButton text="完成服务" pendingText="处理中..." className="bg-blue-500 text-white hover:bg-blue-600" /></form>
        )}
      </div>
      {cancelState.message && <p className="text-xs text-red-500 mt-1">{cancelState.message}</p>}
    </div>
  );
}

// 主客户端组件
export default function BookingManagementClient({
  activeBookings,
  pastBookings,
  activePage,
  totalActivePages,
  pastPage,
  totalPastPages,
}: {
  activeBookings: Booking[];
  pastBookings: Booking[];
  activePage: number;
  totalActivePages: number;
  pastPage: number;
  totalPastPages: number;
}) {
  // 不再需要 useMemo，因为数据已在服务器上分离
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">预约管理</h1>
        
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">当前及未来的预约</h2>
          {activeBookings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeBookings.map(b => <BookingCard key={b.id} booking={b} />)}
              </div>
              <PaginationControls currentPage={activePage} totalPages={totalActivePages} pageParamName="activePage" />
            </>
          ) : <p className="text-gray-500 py-4">当前没有需要处理的预约。</p>}
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">历史预约</h2>
          {pastBookings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
                {pastBookings.map(b => <BookingCard key={b.id} booking={b} />)}
              </div>
              <PaginationControls currentPage={pastPage} totalPages={totalPastPages} pageParamName="pastPage" />
            </>
          ) : <p className="text-gray-500 py-4">暂无历史预约记录。</p>}
        </section>
      </div>
    </main>
  );
}