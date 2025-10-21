// src/app/staff-dashboard/bookings/BookingManagementClient.tsx
'use client';

import { useTransition } from 'react';
import { startService, completeService, cancelBooking } from '@/lib/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import PaginationControls from './PaginationControls';

export default function BookingManagementClient({
  bookings,
  totalCount,
  currentPage,
  limit,
}: {
  bookings: any[];
  totalCount: number;
  currentPage: number;
  limit: number;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleAction = (action: (bookingId: string) => Promise<any>, bookingId: string) => {
    startTransition(async () => {
      try {
        await action(bookingId);
      } catch (error: any) {
        alert(`操作失败: ${error.message}`);
      }
    });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilter = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('filter', newFilter);
    params.set('page', '1'); // Reset to first page on filter change
    router.push(`?${params.toString()}`);
  };
  
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <select
          onChange={handleFilterChange}
          defaultValue={searchParams.get('filter') || 'all'}
          className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-48 p-2.5"
        >
          <option value="all">所有状态</option>
          <option value="confirmed">已确认</option>
          <option value="in_progress">服务中</option>
          <option value="completed">已完成</option>
          <option value="cancelled_by_customer">顾客已取消</option>
          <option value="cancelled_by_worker">技师已取消</option>
        </select>
      </div>
      <div className="bg-card border border-border rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-gray-800">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">服务项目</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">顾客信息</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">预约时间</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">状态</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-white">{booking.services?.name || '未知服务'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {/* 【核心修改】: 显示顾客姓名和联系方式 */}
                    <div className="font-medium text-white">{booking.customer?.full_name || '匿名顾客'}</div>
                    {booking.customer?.bio && (
                      <div className="text-xs text-gray-400 mt-1">
                        联系方式: {booking.customer.bio}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-300">
                    {new Date(booking.start_time).toLocaleString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-300">{booking.status}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium space-x-2">
                    {booking.status === 'confirmed' && (
                      <button onClick={() => handleAction(startService, booking.id)} disabled={isPending} className="text-green-400 hover:text-green-300 disabled:opacity-50">开始服务</button>
                    )}
                    {booking.status === 'in_progress' && (
                      <button onClick={() => handleAction(completeService, booking.id)} disabled={isPending} className="text-blue-400 hover:text-blue-300 disabled:opacity-50">完成服务</button>
                    )}
                    {booking.status === 'confirmed' && (
                       <button onClick={() => { if(confirm('确定要取消这个预约吗？')) handleAction((id) => cancelBooking(null, id), booking.id) }} disabled={isPending} className="text-red-400 hover:text-red-300 disabled:opacity-50">取消预约</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageParamName="page"
      />
    </div>
  );
}